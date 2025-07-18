document.addEventListener('DOMContentLoaded', function () {
  // Helper function to display error messages in plot divs
  function displayError(divId, message) {
    const div = document.getElementById(divId);
    div.innerHTML = `<p class="text-red-600 text-center">${message}</p>`;
  }

  // Fetch data for Heston surface plots...
  fetch('AMZN_heston_surface_data.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('Surface data loaded:', data);
      const S0 = data.S0; // Stock price for OTM reference

      // Extract unique strikes and maturities
      const strikes = [...new Set(data.data.map(item => item.strike))].sort((a, b) => a - b);
      const maturities = [...new Set(data.data.map(item => item.maturity))].sort((a, b) => a - b);

      // Call Price Surface Plot
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
          bgcolor: '#F1F5F9' // Matches --gray-100
        },
        margin: { l: 20, r: 20, b: 20, t: 80 },
        paper_bgcolor: '#F1F5F9', // Matches --gray-100
        plot_bgcolor: '#F1F5F9', // Matches --gray-100
        font: { color: '#1a202c' }
      };

      Plotly.newPlot('surface-plot', surfaceData, surfaceLayout);

      // Volatility Surface Plot
      const impliedVols = maturities.map(() => Array(strikes.length).fill(0));
      const localVols = maturities.map(() => Array(strikes.length).fill(0));
      data.data.forEach(item => {
        const i = maturities.indexOf(item.maturity);
        const j = strikes.indexOf(item.strike);
        impliedVols[i][j] = item.implied_vol;
        localVols[i][j] = item.local_vol !== null ? item.local_vol : 0; // Handle null
      });

      const surfaceData1 = [
        {
          x: strikes,
          y: maturities,
          z: impliedVols,
          type: 'surface',
          colorscale: 'Portland',
          showscale: true,
          colorbar: {
            title: 'Implied Volatility',
            titleside: 'right',
            x: 1.0
          },
          opacity: 0.9
        },
        {
          x: strikes,
          y: maturities,
          z: localVols,
          type: 'surface',
          colorscale: 'Viridis',
          showscale: true,
          colorbar: {
            title: 'Local Volatility',
            titleside: 'right',
            x: 1.15
          },
          opacity: 0.3,
          showlegend: false // Disable legend to avoid duplicate title
        }
      ];

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
          bgcolor: '#F1F5F9' // Matches --gray-100
        },
        margin: { l: 20, r: 40, b: 20, t: 80 },
        paper_bgcolor: '#F1F5F9', // Matches --gray-100
        plot_bgcolor: '#F1F5F9', // Matches --gray-100
        font: { color: '#1a202c' },
        showlegend: true
      };

      Plotly.newPlot('smile-plot', surfaceData1, surfaceLayout1);
    })
    .catch(error => {
      console.error('Error loading surface data:', error);
      displayError('surface-plot', 'Failed to load call price surface plot. Please ensure AMZN_heston_surface_data.json is accessible.');
      displayError('smile-plot', 'Failed to load volatility surface plot. Please ensure AMZN_heston_surface_data.json is accessible.');
    });

  // Call Option Comparison Plot
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
      const heston_fd = data.data.map(item => item.heston_fd);

      if (!strikes || !bs_analytical || !bs_mc || !heston_mc || !heston_fourier || !bs_fd || !heston_fd) {
        throw new Error('Invalid call comparison data structure');
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
        },
        {
          x: strikes,
          y: heston_fourier,
          type: 'scatter',
          mode: 'lines',
          name: 'Heston Fourier',
          line: { color: '#ff0000', width: 2 }
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
          x: [213.57, 213.57],
          y: [0, Math.max(...bs_analytical, ...bs_mc, ...heston_mc) * 1.1],
          type: 'scatter',
          mode: 'lines',
          name: 'Stock Price (OTM Calls > 213.57)',
          line: { color: '#000000', width: 1, dash: 'dash' }
        }
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
          range: [Math.min(...strikes), Math.max(...strikes)]
        },
        yaxis: {
          title: 'Call Option Price ($)',
          titlefont: { color: '#1a202c' },
          tickfont: { color: '#1a202c' },
          gridcolor: '#e2e8f0',
          range: [0, Math.max(...bs_analytical, ...bs_mc, ...heston_mc) * 1.1]
        },
        paper_bgcolor: '#F1F5F9', // Matches --gray-100
        plot_bgcolor: '#F1F5F9', // Matches --gray-100
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

  // Put Option Comparison Plot
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
      const heston_fd = data.data.map(item => item.heston_fd);

      if (!strikes || !bs_analytical || !bs_mc || !heston_mc || !bs_fd || !heston_fourier || !heston_fd) {
        throw new Error('Invalid put comparison data structure');
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
        },
        {
          x: strikes,
          y: heston_fourier,
          type: 'scatter',
          mode: 'lines',
          name: 'Heston Fourier',
          line: { color: '#ff0000', width: 2 }
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
          x: [213.57, 213.57],
          y: [0, Math.max(...bs_analytical.filter(v => v > 0), ...bs_mc.filter(v => v > 0), ...heston_mc) * 1.1],
          type: 'scatter',
          mode: 'lines',
          name: 'Stock Price (OTM Puts < 213.57)',
          line: { color: '#000000', width: 1, dash: 'dash' }
        }
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
          range: [Math.min(...strikes), Math.max(...strikes)]
        },
        yaxis: {
          title: 'Put Option Price ($)',
          titlefont: { color: '#1a202c' },
          tickfont: { color: '#1a202c' },
          gridcolor: '#e2e8f0',
          range: [0, Math.max(...bs_analytical.filter(v => v > 0), ...bs_mc.filter(v => v > 0), ...heston_mc) * 1.1]
        },
        paper_bgcolor: '#F1F5F9', // Matches --gray-100
        plot_bgcolor: '#F1F5F9', // Matches --gray-100
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
      const heston_fd = data.data.map(item => item.heston_fd);

      if (!strikes || !bs_analytical || !bs_mc || !heston_mc || !bs_fd || !heston_fourier || !heston_fd) {
        throw new Error('Invalid put comparison data structure');
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
        },
        {
          x: strikes,
          y: heston_fourier,
          type: 'scatter',
          mode: 'lines',
          name: 'Heston Fourier',
          line: { color: '#ff0000', width: 2 }
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
          x: [213.57, 213.57],
          y: [0, Math.max(...bs_analytical.filter(v => v > 0), ...bs_mc.filter(v => v > 0), ...heston_mc) * 1.1],
          type: 'scatter',
          mode: 'lines',
          name: 'Stock Price (OTM Puts < 213.57)',
          line: { color: '#000000', width: 1, dash: 'dash' }
        }
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
          range: [Math.min(...strikes), Math.max(...strikes)]
        },
        yaxis: {
          title: 'Put Option Price ($)',
          titlefont: { color: '#1a202c' },
          tickfont: { color: '#1a202c' },
          gridcolor: '#e2e8f0',
          range: [0, Math.max(...bs_analytical.filter(v => v > 0), ...bs_mc.filter(v => v > 0), ...heston_mc) * 1.1]
        },
        paper_bgcolor: '#F1F5F9', // Matches --gray-100
        plot_bgcolor: '#F1F5F9', // Matches --gray-100
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
      const heston_fd = data.data.map(item => item.heston_fd);

      if (!strikes || !bs_analytical || !bs_mc || !heston_mc || !bs_fd || !heston_fourier || !heston_fd) {
        throw new Error('Invalid put comparison data structure');
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
        },
        {
          x: strikes,
          y: heston_fourier,
          type: 'scatter',
          mode: 'lines',
          name: 'Heston Fourier',
          line: { color: '#ff0000', width: 2 }
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
          x: [213.57, 213.57],
          y: [0, Math.max(...bs_analytical.filter(v => v > 0), ...bs_mc.filter(v => v > 0), ...heston_mc) * 1.1],
          type: 'scatter',
          mode: 'lines',
          name: 'Stock Price (OTM Puts < 213.57)',
          line: { color: '#000000', width: 1, dash: 'dash' }
        }
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
          range: [Math.min(...strikes), Math.max(...strikes)]
        },
        yaxis: {
          title: 'Put Option Price ($)',
          titlefont: { color: '#1a202c' },
          tickfont: { color: '#1a202c' },
          gridcolor: '#e2e8f0',
          range: [0, Math.max(...bs_analytical.filter(v => v > 0), ...bs_mc.filter(v => v > 0), ...heston_mc) * 1.1]
        },
        paper_bgcolor: '#F1F5F9', // Matches --gray-100
        plot_bgcolor: '#F1F5F9', // Matches --gray-100
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
      const heston_fd = data.data.map(item => item.heston_fd);

      if (!strikes || !bs_analytical || !bs_mc || !heston_mc || !bs_fd || !heston_fourier || !heston_fd) {
        throw new Error('Invalid put comparison data structure');
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
        },
        {
          x: strikes,
          y: heston_fourier,
          type: 'scatter',
          mode: 'lines',
          name: 'Heston Fourier',
          line: { color: '#ff0000', width: 2 }
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
          x: [213.57, 213.57],
          y: [0, Math.max(...bs_analytical.filter(v => v > 0), ...bs_mc.filter(v => v > 0), ...heston_mc) * 1.1],
          type: 'scatter',
          mode: 'lines',
          name: 'Stock Price (OTM Puts < 213.57)',
          line: { color: '#000000', width: 1, dash: 'dash' }
        }
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
          range: [Math.min(...strikes), Math.max(...strikes)]
        },
        yaxis: {
          title: 'Put Option Price ($)',
          titlefont: { color: '#1a202c' },
          tickfont: { color: '#1a202c' },
          gridcolor: '#e2e8f0',
          range: [0, Math.max(...bs_analytical.filter(v => v > 0), ...bs_mc.filter(v => v > 0), ...heston_mc) * 1.1]
        },
        paper_bgcolor: '#F1F5F9', // Matches --gray-100
        plot_bgcolor: '#F1F5F9', // Matches --gray-100
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
// Option Prices Scatter Plot (Call Options: ATM, OTM, ITM)
fetch('AMZNoption_prices.json')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  })
  .then(data => {
    console.log('Option prices data loaded:', data);

    const callData = data.filter(item => item.option_type === 'call');

    if (!callData.length) {
      throw new Error('Invalid option prices data: missing call data');
    }

    const spot = 212;
    const atmRange = 5;
    const otmCallRange = [20, 30];
    const itmCallRange = [10, 20];

    // Filter data for each subplot
    const callAtmData = callData.filter(d => Math.abs(d.strike - spot) < atmRange);
    const callOtmData = callData.filter(d => d.strike - spot > otmCallRange[0] && d.strike - spot < otmCallRange[1]);
    const callItmData = callData.filter(d => d.strike - spot > itmCallRange[0] && d.strike - spot < itmCallRange[1]);

    function createScatterData(dataArray, showLegend) {
      return [
        {
          x: dataArray.map(d => d.time_to_expiry),
          y: dataArray.map(d => d.market_price),
          mode: 'markers',
          type: 'scatter',
          name: 'Market Price',
          marker: { size: 8, symbol: 'star', color: '#000000' },
          showlegend: showLegend
        },
        {
          x: dataArray.map(d => d.time_to_expiry),
          y: dataArray.map(d => d.black_scholes_price),
          mode: 'markers',
          type: 'scatter',
          name: 'Black-Scholes',
          marker: { size: 8, symbol: 'cross', color: '#1f77b4' },
          showlegend: showLegend
        },
        {
          x: dataArray.map(d => d.time_to_expiry),
          y: dataArray.map(d => d.heston_price),
          mode: 'markers',
          type: 'scatter',
          name: 'Heston',
          marker: { size: 8, symbol: 'triangle-up', color: '#ff0000' },
          showlegend: showLegend
        }
      ];
    }

    // Create traces for each subplot
    const callAtmTraces = createScatterData(callAtmData, true);
    const callOtmTraces = createScatterData(callOtmData, false);
    const callItmTraces = createScatterData(callItmData, false);

    // Calculate individual yRange for each subplot (exact min to max)
    const getYRange = (dataArray) => {
      const prices = dataArray.flatMap(d => [d.market_price, d.black_scholes_price, d.heston_price])
        .filter(v => v !== null && !isNaN(v));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return [minPrice, maxPrice];
    };

    const callAtmYRange = getYRange(callAtmData);
    const callOtmYRange = getYRange(callOtmData);
    const callItmYRange = getYRange(callItmData);

    const allCallData = callData;
    const xRange = [
      Math.min(...allCallData.map(d => d.time_to_expiry)),
      Math.max(...allCallData.map(d => d.time_to_expiry))
    ];

    const sharedLayout = {
      xaxis: {
        title: 'Time to Expiry (Years)',
        titlefont: { color: '#1a202c', size: 14 },
        tickfont: { color: '#1a202c' },
        gridcolor: '#e2e8f0'
      },
      paper_bgcolor: '#F1F5F9',
      plot_bgcolor: '#F1F5F9'
    };

    const layout = {
      title: {
        text: 'Call Option Prices vs. Time to Expiry (AMZN)',
        font: { size: 20, family: 'Arial, sans-serif', color: '#1a202c' },
        x: 0.5,
        xanchor: 'center'
      },
      showlegend: true,
      legend: {
        x: 0.35,
        xanchor: 'left',
        y: 1.15,
        orientation: 'h',
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        font: { color: '#1a202c' }
      },
      margin: { l: 80, r: 80, b: 80, t: 150 },
      ...sharedLayout,
      xaxis: { ...sharedLayout.xaxis, domain: [0.0, 0.33], range: xRange, anchor: 'y1' },
      yaxis: { title: 'Option Price ($)', titlefont: { color: '#1a202c' }, tickfont: { color: '#1a202c' }, gridcolor: '#e2e8f0', range: callAtmYRange, domain: [0.0, 1.0], anchor: 'x1' },
      xaxis2: { ...sharedLayout.xaxis, domain: [0.34, 0.66], range: xRange, anchor: 'y2' },
      yaxis2: { title: 'Option Price ($)', titlefont: { color: '#1a202c' }, tickfont: { color: '#1a202c' }, gridcolor: '#e2e8f0', range: callOtmYRange, domain: [0.0, 1.0], anchor: 'x2' },
      xaxis3: { ...sharedLayout.xaxis, domain: [0.67, 1.0], range: xRange, anchor: 'y3' },
      yaxis3: { title: 'Option Price ($)', titlefont: { color: '#1a202c' }, tickfont: { color: '#1a202c' }, gridcolor: '#e2e8f0', range: callItmYRange, domain: [0.0, 1.0], anchor: 'x3' },
      annotations: [
        { text: 'ATM', xref: 'paper', yref: 'paper', x: 0.165, y: 1.05, showarrow: false, font: { size: 16 }, xanchor: 'center' },
        { text: 'OTM', xref: 'paper', yref: 'paper', x: 0.5, y: 1.05, showarrow: false, font: { size: 16 }, xanchor: 'center' },
        { text: 'ITM', xref: 'paper', yref: 'paper', x: 0.835, y: 1.05, showarrow: false, font: { size: 16 }, xanchor: 'center' }
      ]
    };

    const addTraces = (data, xaxis, yaxis) =>
      data.map(trace => ({
        ...trace,
        xaxis,
        yaxis
      }));

    const plotData = [
      ...addTraces(callAtmTraces, 'x1', 'y1'),
      ...addTraces(callOtmTraces, 'x2', 'y2'),
      ...addTraces(callItmTraces, 'x3', 'y3')
    ];

    Plotly.newPlot('call-option-prices-plot', plotData, layout);
  })
  .catch(error => {
    console.error('Call option prices plot error:', error);
    displayError('call-option-prices-plot', 'Failed to load call option prices plot: ' + error.message);
  });

// Option Prices Scatter Plot (Put Options: ATM, OTM, ITM)
fetch('AMZNoption_prices.json')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  })
  .then(data => {
    console.log('Option prices data loaded:', data);

    const putData = data.filter(item => item.option_type === 'put');

    if (!putData.length) {
      throw new Error('Invalid option prices data: missing put data');
    }

    const spot = 212;
    const atmRange = 5;
    const otmPutRange = [20, 30];
    const itmPutRange = [10, 20];

    // Filter data for each subplot
    const putAtmData = putData.filter(d => Math.abs(d.strike - spot) < atmRange);
    const putOtmData = putData.filter(d => d.strike - spot > otmPutRange[0] && d.strike - spot < otmPutRange[1]);
    const putItmData = putData.filter(d => d.strike - spot > itmPutRange[0] && d.strike - spot < itmPutRange[1]);

    function createScatterData(dataArray, showLegend) {
      return [
        {
          x: dataArray.map(d => d.time_to_expiry),
          y: dataArray.map(d => d.market_price),
          mode: 'markers',
          type: 'scatter',
          name: 'Market Price',
          marker: { size: 8, symbol: 'star', color: '#000000' },
          showlegend: showLegend
        },
        {
          x: dataArray.map(d => d.time_to_expiry),
          y: dataArray.map(d => d.black_scholes_price),
          mode: 'markers',
          type: 'scatter',
          name: 'Black-Scholes',
          marker: { size: 8, symbol: 'cross', color: '#1f77b4' },
          showlegend: showLegend
        },
        {
          x: dataArray.map(d => d.time_to_expiry),
          y: dataArray.map(d => d.heston_price),
          mode: 'markers',
          type: 'scatter',
          name: 'Heston',
          marker: { size: 8, symbol: 'triangle-up', color: '#ff0000' },
          showlegend: showLegend
        }
      ];
    }

    // Create traces for each subplot
    const putAtmTraces = createScatterData(putAtmData, true);
    const putOtmTraces = createScatterData(putOtmData, false);
    const putItmTraces = createScatterData(putItmData, false);

    // Calculate individual yRange for each subplot (exact min to max)
    const getYRange = (dataArray) => {
      const prices = dataArray.flatMap(d => [d.market_price, d.black_scholes_price, d.heston_price])
        .filter(v => v !== null && !isNaN(v));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return [minPrice, maxPrice];
    };

    const putAtmYRange = getYRange(putAtmData);
    const putOtmYRange = getYRange(putOtmData);
    const putItmYRange = getYRange(putItmData);

    const allPutData = putData;
    const xRange = [
      Math.min(...allPutData.map(d => d.time_to_expiry)),
      Math.max(...allPutData.map(d => d.time_to_expiry))
    ];

    const sharedLayout = {
      xaxis: {
        title: 'Time to Expiry (Years)',
        titlefont: { color: '#1a202c', size: 14 },
        tickfont: { color: '#1a202c' },
        gridcolor: '#e2e8f0'
      },
      paper_bgcolor: '#F1F5F9',
      plot_bgcolor: '#F1F5F9'
    };

    const layout = {
      title: {
        text: 'Put Option Prices vs. Time to Expiry (AMZN)',
        font: { size: 20, family: 'Arial, sans-serif', color: '#1a202c' },
        x: 0.5,
        xanchor: 'center'
      },
      showlegend: true,
      legend: {
        x: 0.35,
        xanchor: 'left',
        y: 1.15,
        orientation: 'h',
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        font: { color: '#1a202c' }
      },
      margin: { l: 80, r: 80, b: 80, t: 150 },
      ...sharedLayout,
      xaxis: { ...sharedLayout.xaxis, domain: [0.0, 0.33], range: xRange, anchor: 'y1' },
      yaxis: { title: 'Option Price ($)', titlefont: { color: '#1a202c' }, tickfont: { color: '#1a202c' }, gridcolor: '#e2e8f0', range: putAtmYRange, domain: [0.0, 1.0], anchor: 'x1' },
      xaxis2: { ...sharedLayout.xaxis, domain: [0.34, 0.66], range: xRange, anchor: 'y2' },
      yaxis2: { title: 'Option Price ($)', titlefont: { color: '#1a202c' }, tickfont: { color: '#1a202c' }, gridcolor: '#e2e8f0', range: putOtmYRange, domain: [0.0, 1.0], anchor: 'x2' },
      xaxis3: { ...sharedLayout.xaxis, domain: [0.67, 1.0], range: xRange, anchor: 'y3' },
      yaxis3: { title: 'Option Price ($)', titlefont: { color: '#1a202c' }, tickfont: { color: '#1a202c' }, gridcolor: '#e2e8f0', range: putItmYRange, domain: [0.0, 1.0], anchor: 'x3' },
      annotations: [
        { text: 'ATM', xref: 'paper', yref: 'paper', x: 0.165, y: 1.05, showarrow: false, font: { size: 16 }, xanchor: 'center' },
        { text: 'OTM', xref: 'paper', yref: 'paper', x: 0.5, y: 1.05, showarrow: false, font: { size: 16 }, xanchor: 'center' },
        { text: 'ITM', xref: 'paper', yref: 'paper', x: 0.835, y: 1.05, showarrow: false, font: { size: 16 }, xanchor: 'center' }
      ]
    };

    const addTraces = (data, xaxis, yaxis) =>
      data.map(trace => ({
        ...trace,
        xaxis,
        yaxis
      }));

    const plotData = [
      ...addTraces(putAtmTraces, 'x1', 'y1'),
      ...addTraces(putOtmTraces, 'x2', 'y2'),
      ...addTraces(putItmTraces, 'x3', 'y3')
    ];

    Plotly.newPlot('put-option-prices-plot', plotData, layout);
  })
  .catch(error => {
    console.error('Put option prices plot error:', error);
    displayError('put-option-prices-plot', 'Failed to load put option prices plot: ' + error.message);
  });
  
  // LSTM Predictions Plot
  Promise.all([
    fetch('AMZN_market_data.json').then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    }),
    fetch('lstm_predictions.json').then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
  ])
    .then(([marketData, lstmData]) => {
      console.log('Market data loaded:', marketData);
      console.log('Market data type:', typeof marketData);
      console.log('Market data has timestamps:', !!marketData.timestamps);
      console.log('LSTM predictions data:', lstmData);
      console.log('LSTM time_indices length:', lstmData.time_indices?.length);
      console.log('LSTM stock_prices length:', lstmData.stock_prices?.length);
      console.log('LSTM predictions length:', lstmData.predictions?.length);

      // Step 1: Validate marketData
      if (!marketData || typeof marketData !== 'object') {
        throw new Error('marketData is not an object');
      }
      if (!marketData.timestamps || !Array.isArray(marketData.timestamps)) {
        throw new Error('marketData.timestamps is missing or not an array');
      }
      if (!marketData.close || !Array.isArray(marketData.close)) {
        throw new Error('marketData.close is missing or not an array');
      }

      // Step 2: Validate lstmData
      if (!lstmData.time_indices || !Array.isArray(lstmData.time_indices)) {
        throw new Error('lstmData.time_indices is missing or not an array');
      }
      if (!lstmData.stock_prices || !Array.isArray(lstmData.stock_prices)) {
        throw new Error('lstmData.stock_prices is missing or not an array');
      }
      if (!lstmData.predictions || !Array.isArray(lstmData.predictions)) {
        throw new Error('lstmData.predictions is missing or not an array');
      }

      // Step 3: Create timestamp-to-date mapping for tick labels
      const timestampToDate = marketData.timestamps.map((timestamp, index) => ({
        index: index,
        timestamp,
        date: new Date(timestamp),
        monthYear: new Date(timestamp).toLocaleString('en-US', { month: 'short', year: 'numeric' })
      }));

      console.log('Timestamp mapping sample:', timestampToDate.slice(0, 5));

      // Step 4: Select tick labels every 3 months
      const tickIndices = [];
      const tickLabels = [];
      let lastMonthYear = null;
      timestampToDate.forEach((entry, i) => {
        if (!lastMonthYear || entry.monthYear !== lastMonthYear) {
          const currentDate = entry.date;
          const monthDiff = lastMonthYear
            ? (currentDate.getFullYear() - new Date(timestampToDate[tickIndices[tickIndices.length - 1]].timestamp).getFullYear()) * 12 +
              (currentDate.getMonth() - new Date(timestampToDate[tickIndices[tickIndices.length - 1]].timestamp).getMonth())
            : 0;
          if (!lastMonthYear || monthDiff >= 3) {
            tickIndices.push(entry.index);
            tickLabels.push(entry.monthYear);
            lastMonthYear = entry.monthYear;
          }
        }
      });

      console.log('Tick indices:', tickIndices);
      console.log('Tick labels:', tickLabels);

      // Step 5: Prepare prediction time indices (overlay over last 80 historical points)
      const predLength = lstmData.predictions.length; // 80
      const historicalLength = lstmData.time_indices.length; // 499
      const predStartIndex = historicalLength - predLength; // 499 - 80 = 419
      const predIndices = lstmData.time_indices.slice(predStartIndex); // Indices 419 to 498
      const predictedPrices = lstmData.predictions.map(item => item.predicted);

      console.log('Prediction indices sample:', predIndices.slice(0, 5));
      console.log('Predicted prices sample:', predictedPrices.slice(0, 5));

      // Step 6: Validate data lengths
      if (lstmData.time_indices.length !== lstmData.stock_prices.length) {
        throw new Error('Mismatch between time_indices and stock_prices lengths');
      }
      if (predIndices.length !== predictedPrices.length) {
        throw new Error('Mismatch between prediction indices and predicted prices lengths');
      }

      // Step 7: Plot data (train + test with predictions overlaid)
      const plotData = [
        {
          x: lstmData.time_indices,
          y: lstmData.stock_prices,
          type: 'scatter',
          mode: 'lines',
          name: 'Historical Stock Price (Train + Test)',
          line: { color: '#6b7280', width: 1 } // Gray for historical data
        },
        {
          x: predIndices,
          y: predictedPrices,
          type: 'scatter',
          mode: 'lines',
          name: 'LSTM Predicted Price',
          line: { color: '#ff7f0e', width: 2 } // Orange for predictions
        }
      ];

      const layout = {
        title: {
          text: 'LSTM Stock Price Predictions vs Historical (AMZN)',
          font: { size: 20, family: 'Arial, sans-serif', color: '#1a202c' },
          x: 0.5,
          xanchor: 'center'
        },
        xaxis: {
          title: 'Time Index',
          titlefont: { color: '#1a202c' },
          tickfont: { color: '#1a202c' },
          gridcolor: '#e2e8f0',
          tickvals: tickIndices,
          ticktext: tickLabels,
          range: [Math.min(...lstmData.time_indices), Math.max(...lstmData.time_indices)]
        },
        yaxis: {
          title: 'Stock Price ($)',
          titlefont: { color: '#1a202c' },
          tickfont: { color: '#1a202c' },
          gridcolor: '#e2e8f0',
          range: [Math.min(...lstmData.stock_prices, ...predictedPrices) * 0.95, Math.max(...lstmData.stock_prices, ...predictedPrices) * 1.05]
        },
        paper_bgcolor: '#F1F5F9', // Matches --gray-100
        plot_bgcolor: '#F1F5F9', // Matches --gray-100
        margin: { l: 60, r: 20, b: 60, t: 80 },
        showlegend: true,
        legend: {
          x: 1,
          xanchor: 'right',
          y: 1,
          bgcolor: 'rgba(255, 255, 255, 0.5)'
        }
      };

      Plotly.newPlot('lstm-plot', plotData, layout);
    })
    .catch(error => {
      console.error('LSTM predictions plot error:', error);
      displayError('lstm-plot', 'Failed to load LSTM predictions plot: ' + error.message);
    });
});
