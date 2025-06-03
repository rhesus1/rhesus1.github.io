document.addEventListener('DOMContentLoaded', function () {
  // Generate data for Heston model volatility surface
  const strikes = Array.from({ length: 20 }, (_, i) => 80 + i * 2); // Strikes: 80 to 120
  const volatilities = Array.from({ length: 20 }, (_, i) => 0.1 + i * 0.02); // Vol: 0.1 to 0.5
  const z = strikes.map(strike => 
    volatilities.map(vol => {
      // Simplified Black-Scholes call price as a placeholder (Heston PDE would be more complex)
      const S = 100; // Spot price
      const r = 0.05; // Risk-free rate
      const T = 1; // Time to maturity
      const d1 = (Math.log(S / strike) + (r + vol * vol / 2) * T) / (vol * Math.sqrt(T));
      const d2 = d1 - vol * Math.sqrt(T);
      const callPrice = S * normCDF(d1) - strike * Math.exp(-r * T) * normCDF(d2);
      return Math.max(0, callPrice); // Ensure non-negative prices
    })
  );

  // Normal CDF approximation for Black-Scholes
  function normCDF(x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    let prob = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + 1.330274429 * t))));
    return x > 0 ? 1 - prob : prob;
  }

  // Plotly 3D surface plot
  const data = [{
    x: strikes,
    y: volatilities,
    z: z,
    type: 'surface',
    colorscale: 'Viridis',
    showscale: true,
  }];

  const layout = {
    title: 'Heston Model: Option Price Surface',
    scene: {
      xaxis: { title: 'Strike Price' },
      yaxis: { title: 'Volatility' },
      zaxis: { title: 'Call Option Price' },
    },
    margin: { l: 20, r: 20, b: 20, t: 50 },
  };

  Plotly.newPlot('plotly-chart', data, layout);
});
