document.addEventListener('DOMContentLoaded', function () {
  // Helper function to display error messages in plot divs
  function displayError(divId, message) {
    const div = document.getElementById(divId);
    div.innerHTML = `<p class="text-red-600 text-center">${message}</p>`;
  }

  // Load 3D surface plot data
  fetch('AMZN_heston_surface_data.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('Surface data loaded:', data);
      // Extract unique strikes and maturities
      const strikes = [...new Set(data.data.map(item => item.strike))].sort((a, b) => a - b);
      const maturities = [...new Set(data.data.map(item => item.maturity))].sort((a, b) => a - b);
      
      // Create 2D array for call prices
      const prices = maturities.map(() => Array(strikes.length).fill(0));
      data.data.forEach(item => {
        const i = maturities.indexOf(item.maturity);
        const j = strikes.indexOf(item.strike);
        prices[i][j] = item.call_price;
      });

      if (!strikes.length || !maturities.length || !prices.length) {
        throw new Error('Invalid surface data structure');
      }

      const surfaceData = [{
        x: strikes,
        y: maturities,
        z: prices,
        type: 'surface',
        colorscale: 'Portland',
        showscale: true,
        colorbar: {
          title: 'Call Price ($)',
          titleside: 'right'
        }
      }];

      const surfaceLayout = {
        title: {
          text: 'Heston Model: Call Option Price Surface (AMZN)',
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
      displayError('surface-plot', 'Failed to load 3D surface plot. Please ensure AMZN_heston_surface_data.json is accessible.');
    });

  fetch('AMZN_heston_surface_data.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('Surface data loaded:', data);
      // Extract unique strikes and maturities
      const strikes1 = [...new Set(data.data.map(item => item.strike))].sort((a, b) => a - b);
      const maturities1 = [...new Set(data.data.map(item => item.maturity))].sort((a, b) => a - b);
      
      // Create 2D array for call prices
      const vols = maturities1.map(() => Array(strikes1.length).fill(0));
      data.data.forEach(item => {
        const i = maturities1.indexOf(item.maturity);
        const j = strikes1.indexOf(item.strike);
        vols[i][j] = item.implied_vol;
      });

      if (!strikes1.length || !maturities1.length || !vols.length) {
        throw new Error('Invalid surface data structure');
      }

      const surfaceData1 = [{
        x: strikes1,
        y: maturities1,
        z: vols,
        type: 'surface',
        colorscale: 'Portland',
        showscale: true,
        colorbar: {
          title: 'Volatility',
          titleside: 'right'
        }
      }];

      const surfaceLayout1 = {
        title: {
          text: 'Heston Model: Volatility Surface (AMZN)',
          font: { size: 20, family: 'Arial, sans-serif', color: '#1a202c' },
          x: 0.5,
          xanchor: 'center'
        },
        scene: {
          xaxis: { title: 'Strike Price ($)', gridcolor: 'white', titlefont: { color: '#1a202c' }, tickfont: { color: '#1a202c' } },
          yaxis: { title: 'Time to Maturity (Years)', gridcolor: 'white', titlefont: { color: '#1a202c' }, tickfont: { color: '#1a202c' } },
          zaxis: { title: 'Volatility', gridcolor: 'white', titlefont: { color: '#1a202c' }, tickfont: { color: '#1a202c' } },
          camera: { eye: { x: 1.5, y: 1.5, z: 0.8 } },
          bgcolor: 'rgb(255, 255, 255)'
        },
        margin: { l: 20, r: 20, b: 20, t: 80 },
        paper_bgcolor: 'rgb(255, 255, 255)',
        font: { color: '#1a202c' }
      };

        Plotly.newPlot('smile-plot', surfaceData1, surfaceLayout1);
    })
    .catch(error => {
      console.error('Error loading surface data:', error);
      displayError('smile-plot', 'Failed to load 3D surface plot. Please ensure AMZN_volatility_surface_data.json is accessible.');
    });


  // Load call option comparison plot data
  fetch('AMZN_call_option_pricing_comparison.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('Call comparison data:', data);
      const strikes = data.data.map(item => item.strike);
      const bs_analytical = data.data.map(item => item.bs_analytical);
      const bs_mc = data.data.map(item => item.bs_mc);
      const heston_fourier = data.data.map(item => item.heston_fourier);
      const heston_mc = data.data.map(item => item.heston_mc);
      const bs_fd = data.data.map(item => item.bs_fd);

      if (!strikes || !bs_analytical || !bs_mc || !heston_mc || !bs_fd) {
        throw new Error('Invalid call comparison data structure');
      }

      // Update market data points (approximated from data)
      const market_data = {
        x: [160, 180, 200, 220, 240],
        y: [60.27, 42.87, 23.22, 2.99, 4.14] // Heston Fourier prices as proxy
      };

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
          y: bs_mc,
          type: 'scatter',
          mode: 'lines',
          name: 'Black-Scholes Monte Carlo',
          line: { color: '#2ca02c', width: 2 }
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
          y: heston_mc,
          type: 'scatter',
          mode: 'lines',
          name: 'Heston Monte Carlo',
          line: { color: '#9467bd', width: 2 }
        }//,
        // {
         // x: strikes,
         // y: heston_fourier,
         // type: 'scatter',
         // mode: 'lines',
         // name: 'Heston Fourier',
         // line: { color: '#ff0000', width: 2 }
        //}
      ];

      const layout = {
        title: {
          text: 'Call Option Pricing Model Comparison (AMZN, T=0.25)',
          font: { size: 20, family: 'Arial, sans-serif', color: '#1a202c' },
          x: 0.5,
          xanchor: 'center'
        },
        xaxis: {
          title: 'Strike Price ($)',
          titlefont: { color: '#1a202c' },
          tickfont: { color: '#1a202c' },
          gridcolor: '#e2e8f0',
          range: [180, 280]
        },
        yaxis: {
          title: 'Call Option Price ($)',
          titlefont: { color: '#1a202c' },
          tickfont: { color: '#1a202c' },
          gridcolor: '#e2e8f0',
          range: [0, Math.max(...bs_analytical, ...bs_mc, ...heston_mc, ...market_data.y) * 1.1]
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

      Plotly.newPlot('comparison-plot', plotData, layout);
    })
    .catch(error => {
      console.error('Call comparison plot error:', error);
      displayError('comparison-plot', 'Failed to load call comparison plot: ' + error.message);
    });

  // Load put option comparison plot data
  fetch('AMZN_put_option_pricing_comparison.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('Put comparison data:', data);
      const strikes = data.data.map(item => item.strike);
      const bs_analytical = data.data.map(item => item.bs_analytical);
      const bs_mc = data.data.map(item => item.bs_mc);
      const heston_mc = data.data.map(item => item.heston_mc);
      const bs_fd = data.data.map(item => item.bs_fd);
      const heston_fourier = data.data.map(item => item.heston_fourier);
      
      if (!strikes || !bs_analytical || !bs_mc || !heston_mc || !bs_fd) {
        throw new Error('Invalid put comparison data structure');
      }

      // Update market data points (approximated from data)
      const market_data = {
        x: [160, 180, 200, 220, 240],
        y: [4.72, 7.06, 7.17, 6.68, 27.59] // Heston Fourier prices as proxy
      };

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
          y: bs_mc,
          type: 'scatter',
          mode: 'lines',
          name: 'Black-Scholes Monte Carlo',
          line: { color: '#2ca02c', width: 2 }
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
          y: heston_mc,
          type: 'scatter',
          mode: 'lines',
          name: 'Heston Monte Carlo',
          line: { color: '#9467bd', width: 2 }
        }//,
         //{
          //x: strikes,
          //y: heston_fourier,
          //type: 'scatter',
          //mode: 'lines',
          //name: 'Heston Fourier',
          //line: { color: '#ff0000', width: 2 }
       // }
      ];

      const layout = {
        title: {
          text: 'Put Option Pricing Model Comparison (AMZN, T=0.25)',
          font: { size: 20, family: 'Arial, sans-serif', color: '#1a202c' },
          x: 0.5,
          xanchor: 'center'
        },
        xaxis: {
          title: 'Strike Price ($)',
          titlefont: { color: '#1a202c' },
          tickfont: { color: '#1a202c' },
          gridcolor: '#e2e8f0',
          range: [180, 280]
        },
        yaxis: {
          title: 'Put Option Price ($)',
          titlefont: { color: '#1a202c' },
          tickfont: { color: '#1a202c' },
          gridcolor: '#e2e8f0',
          range: [0, Math.max(...bs_analytical.filter(v => v > 0), ...bs_mc.filter(v => v > 0), ...heston_mc, ...market_data.y) * 1.1]
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

      Plotly.newPlot('comparison-plot-put', plotData, layout);
    })
    .catch(error => {
      console.error('Put comparison plot error:', error);
      displayError('comparison-plot-put', 'Failed to load put comparison plot: ' + error.message);
    });
});
