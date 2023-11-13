import hvplot.pandas
# import numpy as np
import panel as pn
import pandas as pd

pn.extension(sizing_mode="stretch_width")

wheight = pn.widgets.FloatSlider(name="Height (cm)", start=0, end=250, value=100)
wweight = pn.widgets.FloatSlider(name="Weight (kg)", start=0, end=250, value= 30)
wage = pn.widgets.FloatSlider(name="Age (years)", start=0, end=150,value=15)
# wgender= pn.widgets.Switch(name='Gender')

def sizedf(height, weight, age):
    points = {'height':[height,height,None,None],'weight':[weight,weight,None,None],'age':[age,age,0,150],
              'gender':['male','female','male','female'], 'marker':['square_cross','star_dot',None,None],
              'size_v':[age+weight+height+30,age+height+weight-30,None,None]}
    return pd.DataFrame(points)

dfi_size = hvplot.bind(sizedf, wheight, wweight,wage).interactive()

plot_opts = dict(
    responsive=True,
    max_height=300
    # Align the curves' color with the template's color
    # color=pn.template.FastGridTemplate.accent_base_color
)

# Instantiate the template with widgets displayed in the sidebar
template = pn.template.BootstrapTemplate(
    title="Heart valve sizes",
    sidebar=[wheight, wweight, wage]
)

ploths = dfi_size.hvplot.scatter(title='Valve size', x='weight',y='size_v',
                                                s='size_v',color='age',marker='marker',alpha=0.5,
                                                xlim=(0,250),ylim=(0,500),**plot_opts,clabel="Age")
plotlabels = dfi_size.hvplot.labels(x='weight',y='size_v',s='size_v',text=str('size_v'),
                                    xlim=(0,250),ylim=(0,500),**plot_opts)
# Populate the main area with plots, to demonstrate the grid-like API

maincol1 = (ploths * plotlabels.opts(xoffset=30)).output()

# template.main[:2, :6] = maincol1

plothsheight = dfi_size.hvplot.scatter(title='Valve size', x='height',y='gender', color='age',
                                                s='size_v',marker='marker',alpha=0.5,
                                                xlim=(0,250),ylim=(0,500),**plot_opts,colorbar=False).output()

template.main.append(
    pn.Row(
        pn.Card(maincol1),
        pn.Card(plothsheight),
    )
)
# maincol2 = pn.Column(plothsheight.output(), sizing_mode="stretch_both")


# template.main[:2, 6:12] = maincol2

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
