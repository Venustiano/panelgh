importScripts("https://cdn.jsdelivr.net/pyodide/v0.24.1/pyc/pyodide.js");

function sendPatch(patch, buffers, msg_id) {
  self.postMessage({
    type: 'patch',
    patch: patch,
    buffers: buffers
  })
}

async function startApplication() {
  console.log("Loading pyodide!");
  self.postMessage({type: 'status', msg: 'Loading pyodide'})
  self.pyodide = await loadPyodide();
  self.pyodide.globals.set("sendPatch", sendPatch);
  console.log("Loaded!");
  await self.pyodide.loadPackage("micropip");
  const env_spec = ['https://cdn.holoviz.org/panel/wheels/bokeh-3.3.1-py3-none-any.whl', 'https://cdn.holoviz.org/panel/1.3.1/dist/wheels/panel-1.3.1-py3-none-any.whl', 'pyodide-http==0.2.1', 'hvplot', 'matplotlib']
  for (const pkg of env_spec) {
    let pkg_name;
    if (pkg.endsWith('.whl')) {
      pkg_name = pkg.split('/').slice(-1)[0].split('-')[0]
    } else {
      pkg_name = pkg
    }
    self.postMessage({type: 'status', msg: `Installing ${pkg_name}`})
    try {
      await self.pyodide.runPythonAsync(`
        import micropip
        await micropip.install('${pkg}');
      `);
    } catch(e) {
      console.log(e)
      self.postMessage({
	type: 'status',
	msg: `Error while installing ${pkg_name}`
      });
    }
  }
  console.log("Packages loaded!");
  self.postMessage({type: 'status', msg: 'Executing code'})
  const code = `
  
import asyncio

from panel.io.pyodide import init_doc, write_doc

init_doc()

import hvplot.pandas
# import numpy as np
import panel as pn
import pandas as pd
# from plotnine import ggplot, geom_point, aes
# xs = np.linspace(0, np.pi)

# weightspace = np.linspace(0, 200)
# heightspace = np.linspace(0, 250)
# agespace = np.linspace(0, 150)

# freq = pn.widgets.FloatSlider(name="Height", start=0, end=10, value=2)
# phase = pn.widgets.FloatSlider(name="Weight", start=0, end=np.pi)

wheight = pn.widgets.FloatSlider(name="Height (cm)", start=0, end=250, value=100)
wweight = pn.widgets.FloatSlider(name="Weight (kg)", start=0, end=250, value= 30)
wage = pn.widgets.FloatSlider(name="Age (years)", start=0, end=150,value=15)
# wgender= pn.widgets.Switch(name='Gender')

def sizedf(height, weight, age):
    points = {'height':[height,height,None,None],'weight':[weight,weight,None,None],'age':[age,age,0,150],
              'gender':['male','female','male','female'], 'marker':['square_cross','star_dot',None,None],
              'size_v':[age+weight+height+30,age+height+weight-30,None,None]}
    return pd.DataFrame(points)

# def sine(freq, phase):
#     return pd.DataFrame(dict(y=np.sin(xs*freq+phase)), index=xs)

# def cosine(freq, phase):
#     return pd.DataFrame(dict(y=np.cos(xs*freq+phase)), index=xs)

# dfi_sine = hvplot.bind(sine, freq, phase).interactive()
# dfi_cosine = hvplot.bind(cosine, freq, phase).interactive()

dfi_size = hvplot.bind(sizedf, wheight, wweight,wage).interactive()
# dfi_cosine = hvplot.bind(cosine, freq, phase).interactive()

plot_opts = dict(
    responsive=True, min_height=400
    # Align the curves' color with the template's color
    # color=pn.template.FastGridTemplate.accent_base_color
)

# Instantiate the template with widgets displayed in the sidebar
template = pn.template.FastGridTemplate(
    title="Heart valve sizes",
    sidebar=[wheight, wweight, wage],
)

ploths = dfi_size.hvplot.scatter(title='Valve size', x='weight',y='size_v',
                                                s='size_v',color='age',marker='marker',alpha=0.5,
                                                xlim=(0,250),ylim=(0,500),**plot_opts,clabel="Age")
plotlabels = dfi_size.hvplot.labels(x='weight',y='size_v',s='size_v',text=str('size_v'),
                                    xlim=(0,250),ylim=(0,500),**plot_opts)
# Populate the main area with plots, to demonstrate the grid-like API

# plotsize = (ggplot(dfi_size,aes(x="height",y="size"))
#             + geom_point()
#             )

template.main[:3, :6] = (ploths.opts(show_legend=True) * plotlabels.opts(xoffset=30)).output()

# dfi_size.hvplot.scatter(title='Height vs size', x='height',y='size_v',
#                                                 s='size_v',color='gender',marker='marker',alpha=0.5,
#                                                 xlim=(0,250),ylim=(0,500),**plot_opts).output()

plothsheight = dfi_size.hvplot.scatter(title='Valve size', x='height',y='gender', color='age',
                                                s='size_v',marker='marker',alpha=0.5,
                                                xlim=(0,250),ylim=(0,500),**plot_opts,colorbar=False)
# plotlabelsheight = dfi_size.hvplot.labels(x='height',y='weight',s='size_v',text=str('size_v'),
#                                     xlim=(0,250),ylim=(0,500),**plot_opts,text_baseline='top')
                                                
# template.main[:3, 6:] = dfi_size.hvplot.scatter(title='Weight vs size', x='weight',y='size_v',
#                                                 s='size_v',color='gender',marker='marker', alpha=0.5,xlim=(0,200),ylim=(0,500),
#                                                 **plot_opts).output()

# template.main[:3, 6:] = (plothsheight * plotlabelsheight.opts(xoffset=30)).output()

template.main[:3, 6:] = (plothsheight).output()


template.servable();


# import panel as pn
# import hvplot.pandas
# import pandas as pd
# import numpy as np

# pn.extension(design='material')

# csv_file = ("https://raw.githubusercontent.com/holoviz/panel/main/examples/assets/occupancy.csv")
# data = pd.read_csv(csv_file, parse_dates=["date"], index_col="date")

# def transform_data(variable, window, sigma):
#     ''' Calculates the rolling average and the outliers '''
#     avg = data[variable].rolling(window=window).mean()
#     residual = data[variable] - avg
#     std = residual.rolling(window=window).std()
#     outliers = np.abs(residual) > std * sigma
#     return avg, avg[outliers]

# def create_plot(variable="Temperature", window=30, sigma=10):
#     ''' Plots the rolling average and the outliers '''
#     avg, highlight = transform_data(variable, window, sigma)
#     return avg.hvplot(height=300, width=400, legend=False) * highlight.hvplot.scatter(
#         color="orange", padding=0.1, legend=False
#     )

# variable_widget = pn.widgets.Select(name="variable", value="Temperature", options=list(data.columns))
# window_widget = pn.widgets.IntSlider(name="window", value=30, start=1, end=60)
# sigma_widget = pn.widgets.IntSlider(name="sigma", value=10, start=0, end=20)

# bound_plot = pn.bind(create_plot, variable=variable_widget, window=window_widget, sigma=sigma_widget)


# first_app = pn.Column(variable_widget, window_widget, sigma_widget, bound_plot)

# first_app.servable()


await write_doc()
  `

  try {
    const [docs_json, render_items, root_ids] = await self.pyodide.runPythonAsync(code)
    self.postMessage({
      type: 'render',
      docs_json: docs_json,
      render_items: render_items,
      root_ids: root_ids
    })
  } catch(e) {
    const traceback = `${e}`
    const tblines = traceback.split('\n')
    self.postMessage({
      type: 'status',
      msg: tblines[tblines.length-2]
    });
    throw e
  }
}

self.onmessage = async (event) => {
  const msg = event.data
  if (msg.type === 'rendered') {
    self.pyodide.runPythonAsync(`
    from panel.io.state import state
    from panel.io.pyodide import _link_docs_worker

    _link_docs_worker(state.curdoc, sendPatch, setter='js')
    `)
  } else if (msg.type === 'patch') {
    self.pyodide.globals.set('patch', msg.patch)
    self.pyodide.runPythonAsync(`
    state.curdoc.apply_json_patch(patch.to_py(), setter='js')
    `)
    self.postMessage({type: 'idle'})
  } else if (msg.type === 'location') {
    self.pyodide.globals.set('location', msg.location)
    self.pyodide.runPythonAsync(`
    import json
    from panel.io.state import state
    from panel.util import edit_readonly
    if state.location:
        loc_data = json.loads(location)
        with edit_readonly(state.location):
            state.location.param.update({
                k: v for k, v in loc_data.items() if k in state.location.param
            })
    `)
  }
}

startApplication()