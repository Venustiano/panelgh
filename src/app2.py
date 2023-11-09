import numpy as np
import matplotlib.pyplot as plt
import panel as pn

pn.extension(template='fast')

freq = pn.widgets.FloatSlider(
    name='Frequency', start=0, end=10, value=5
).servable(target='sidebar')

ampl = pn.widgets.FloatSlider(
    name='Amplitude', start=0, end=1, value=0.5
).servable(target='sidebar')

def plot(freq, ampl):
    plt.close()
    fig = plt.figure()
    ax = fig.add_subplot(111)
    xs = np.linspace(0, 1)
    ys = np.sin(xs*freq)*ampl
    ax.plot(xs, ys)
    return fig

mpl = pn.pane.Matplotlib(
    pn.bind(plot, freq, ampl)
)

pn.Column(
    '# Sine curve', mpl
).servable(target='main')
