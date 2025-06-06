document.addEventListener('DOMContentLoaded', function () {
  // Helper function to display error messages in plot divs
  function displayError(divId, message) {
    const div = document.getElementById(divId);
    div.innerHTML = `<p class="text-red-600 text-center">${message}</p>`;
  }

  // Reusable function to generate comparison plots
  function plotComparison(divId, jsonFile, title, yAxisTitle) {
    fetch(jsonFile)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log(`${title} data:`, data);
        const { strikes, bs_analytical, bs_fd, bs_mc, heston_fourier, heston_mc, heston_fd, market_data } = data;

        // Validate data
        if (!strikes || !bs_analytical || !bs_fd || !bs_mc || !heston_fourier || !heston_mc || !heston_fd || !market_data) {
          throw new Error('Invalid comparison data structure');
        }

        const plotData = [
          {
            x: strikes,
            y: bs_analytical,
            type: 'scatter',
            mode: 'lines',
            name: 'Black-Scholes Analytical',
            line: { color: '#1f77b4', width: 2 }
          },
          {
            x: strikes,
            y: bs_fd,
            type: 'scatter',
            mode: 'lines',
            name: 'Black-Scholes Finite Difference',
            line: { color: '#ff7f0e', width: 2 }
          },
          {
            x: strikes,
            y: bs_mc,
            type: 'scatter',
            mode: 'lines',
            name: 'Black-Scholes Monte Carlo',
            line: { color: '#2ca02c', width: 2 }
          },
          {
            x: strikes,
            y: heston_fourier,
            type: 'scatter',
            mode: 'lines',
            name: 'Heston Fourier',
            line: { color: '#d62728', width: 2 }
          },
          {
            x: strikes,
            y: heston_mc,
            type: 'scatter',
            mode: 'lines',
            name: 'Heston Monte Carlo',
            line: { color: '#9467bd', width: 2 }
          },
          {
            x: strikes,
            y: heston_fd,
            type: 'scatter',
            mode: 'lines',
            name: 'Heston Finite Difference',
            line: { color: '#17becf', width: 2 }
          },
          {
            x: market_data.x,
            y: market_data.y,
            type: 'scatter',
            mode: 'markers',
            name: 'Market Data',
            marker: { color: 'black', size: 10, symbol: 'star' }
          }
        ];

        const layout = {
          title: {
            text: title,
            font: { size: 20, family: 'Arial, sans-serif', color: '#1a202c' },
            x: 0.5,
            xanchor: 'center'
          },
          xaxis: {
            title: 'Strike Price ($)',
            titlefont: { color: '#1a202c' },
            tickfont: { color: '#1a202c' },
            gridcolor: '#e2e8f0',
            range: [Math.min(...strikes), Math.max(...strikes)]
          },
          yaxis: {
            title: yAxisTitle,
            titlefont: { color: '#1a202c' },
            tickfont: { color: '#1a202c' },
            gridcolor: '#e2e8f0',
            range: [0, Math.max(...bs_analytical, ...bs_fd, ...bs_mc, ...heston_fourier, ...heston_mc, ...heston_fd, ...market_data.y) * 1.1]
          },
          paper_bgcolor: 'rgb(255, 255, 255)',
          plot_bgcolor: 'rgb(255, 255, 255)',
          margin: { l: 60, r: 20, b: 60, t: 80 },
          showlegend: true,
          legend: {
            x: 1,
            xanchor: 'right',
            y: 1,
            bgcolor: 'rgba(255, 255, 255, 0.5)'
          }
        };

        Plotly.newPlot(divId, plotData, layout);
      })
      .catch(error => {
        console.error(`${title} plot error:`, error);
        displayError(divId, `Failed to load ${title.toLowerCase()}: ${error.message}`);
      });
  }

  // Load 3D surface plot
  fetch('heston_surface_data.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('Surface data loaded:', data);
      const { strikes, maturities, prices } = data;

      if (!strikes || !maturities || !prices) {
        throw new Error('Invalid surface data structure');
      }

      const surfaceData = [{
        x: strikes,
        y: maturities,
        z: prices,
        type: 'surface',
        colorscale: 'Portland',
        showscale: true,
        colorbar: { title: 'Call Price ($)', titleside: 'right' }
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
    .catch(error => {
      console.error('Error loading surface data:', error);
      displayError('surface-plot', 'Failed to load 3D surface plot. Please ensure heston_surface_data.json is accessible.');
    });

  // Load 2D smile animation
  fetch('heston_smile_data.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('Smile data loaded:', data);
      const { strikes, times, implied_vols } = data;

      if (!strikes || !times || !implied_vols) {
        throw new Error('Invalid smile data structure');
      }

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
    .catch(error => {
      console.error('Error loading smile data:', error);
      displayError('smile-plot', 'Failed to load 2D smile animation. Please ensure heston_smile_data.json is accessible.');
    });

  // Generate call and put option comparison plots
  plotComparison('comparison-plot', 'call_option_pricing_comparison.json', 'Call Option Pricing Model Comparison', 'Call Option Price ($)');
  plotComparison('comparison-plot-put', 'put_option_pricing_comparison.json', 'Put Option Pricing Model Comparison', 'Put Option Price ($)');
});
