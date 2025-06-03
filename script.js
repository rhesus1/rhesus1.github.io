document.addEventListener('DOMContentLoaded', function () {
  // Load 3D surface plot data
  fetch('heston_surface_data.json')
    .then(response => response.json())
    .then(data => {
      const strikes = data.strikes;
      const maturities = data.maturities;
      const prices = data.prices;

      const surfaceData = [{
        x: strikes,
        y: maturities,
        z: prices,
        type: 'surface',
        colorscale: 'Plasma',
        showscale: true,
        colorbar: {
          title: 'Call Price ($)',
          titleside: 'right'
        }
      }];

      const surfaceLayout = {
        title: {
          text: 'Heston Model: Call Option Price Surface',
          font: { size: 20, family: 'Arial, sans-serif', color: '#1a202c' },
          x: 0.5,
          xanchor: 'center'
        },
        scene: {
          xaxis: { title: 'Strike Price ($)', gridcolor: 'white', titlefont: { color: '#1a202c' }, tickfont: { color: '#1a202c' } },
          yaxis: { title: 'Time to Maturity (Years)', gridcolor: 'white', titlefont: { color: '#1a202c' }, tickfont: { color: '#1a202c' } },
          zaxis: { title: 'Call Option Price ($)', gridcolor: 'white', titlefont: { color: '#1a202c' }, tickfont: { color: '#1a202c' } },
          camera: { eye: { x: 1.5, y: 1.5, z: 0.8 } },
          bgcolor: 'rgb(255, 255, 255)'
        },
        margin: { l: 20, r: 20, b: 20, t: 80 },
        paper_bgcolor: 'rgb(255, 255, 255)',
        font: { color: '#1a202c' }
      };

      Plotly.newPlot('surface-plot', surfaceData, surfaceLayout);
    })
    .catch(error => console.error('Error loading surface data:', error));

  // Load 2D smile animation data
  fetch('heston_smile_data.json')
    .then(response => response.json())
    .then(data => {
      const strikes = data.strikes;
      const times = data.times;
      const implied_vols = data.implied_vols;

      // Create frames for animation
      const frames = times.map((time, index) => ({
        name: `T=${time.toFixed(2)}`,
        data: [{
          x: strikes,
          y: implied_vols[index],
          type: 'scatter',
          mode: 'lines+markers',
          line: { color: '#7b3fe4', width: 2 },
          marker: { size: 6 }
        }]
      }));

      // Initial plot data
      const plotData = [{
        x: strikes,
        y: implied_vols[0],
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: '#7b3fe4', width: 2 },
        marker: { size: 6 }
      }];

      const layout = {
        title: {
          text: 'Heston Model: Implied Volatility Smile',
          font: { size: 20, family: 'Arial, sans-serif', color: '#1a202c' },
          x: 0.5,
          xanchor: 'center'
        },
        xaxis: {
          title: 'Strike Price ($)',
          titlefont: { color: '#1a202c' },
          tickfont: { color: '#1a202c' },
          gridcolor: '#e2e8f0'
        },
        yaxis: {
          title: 'Implied Volatility',
          titlefont: { color: '#1a202c' },
          tickfont: { color: '#1a202c' },
          gridcolor: '#e2e8f0',
          range: [0, Math.max(...implied_vols.flat()) * 1.1]
        },
        paper_bgcolor: 'rgb(255, 255, 255)',
        plot_bgcolor: 'rgb(255, 255, 255)',
        margin: { l: 60, r: 20, b: 60, t: 80 },
        updatemenus: [{
          buttons: [
            {
              method: 'animate',
              args: [null, {
                frame: { duration: 500, redraw: true },
                fromcurrent: true,
                transition: { duration: 300, easing: 'quadratic-in-out' }
              }],
              label: 'Play'
            },
            {
              method: 'animate',
              args: [[null], {
                mode: 'immediate',
                frame: { duration: 0 },
                transition: { duration: 0 }
              }],
              label: 'Pause'
            }
          ],
          direction: 'left',
          pad: { r: 10, t: 10 },
          showactive: true,
          type: 'buttons',
          x: 0.1,
          xanchor: 'right',
          y: 0,
          yanchor: 'top'
        }],
        sliders: [{
          pad: { t: 20 },
          currentvalue: {
            prefix: 'Time to Maturity: ',
            font: { size: 14, color: '#1a202c' }
          },
          steps: times.map((time, index) => ({
            label: `${time.toFixed(2)}`,
            method: 'animate',
            args: [[`T=${time.toFixed(2)}`], {
              mode: 'immediate',
              frame: { duration: 0 },
              transition: { duration: 0 }
            }]
          }))
        }]
      };

      Plotly.newPlot('smile-plot', plotData, layout).then(() => {
        Plotly.addFrames('smile-plot', frames);
      });
    })
    .catch(error => console.error('Error loading smile data:', error));
});
