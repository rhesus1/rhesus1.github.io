document.addEventListener('DOMContentLoaded', function () {
  // Helper function to display error messages in plot divs
  function displayError(divId, message) {
    const div = document.getElementById(divId);
    div.innerHTML = `<p class="text-red-600 text-center">${message}</p>`;
  }

  // Load 3D surface plot data
  fetch('heston_surface_data.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('Surface data loaded:', data);
      const strikes = data.strikes;
      const maturities = data.maturities;
      const prices = data.prices;

      if (!strikes || !maturities || !prices) {
        throw new Error('Invalid surface data structure');
      }

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
          font: { size: 16, family: 'Inter, sans-serif', color: '#1a202c' },
          x: 0.5,
          xanchor: 'center'
        },
        scene: {
          xaxis: { title: 'Strike Price ($)', gridcolor: 'white', titlefont: { color: '#1a202c', size: 12 }, tickfont: { color: '#1a202c', size: 10 } },
          yaxis: { title: 'Time to Maturity (Years)', gridcolor: 'white', titlefont: { color: '#1a202c', sizeThe provided `index.html`, `style.css`, and `script.js` files are already well-structured for a responsive academic website, but they need specific adjustments to ensure full compatibility across desktop and mobile devices, particularly for text width, layout, and element sizing. Below is a comprehensive guide to make your website fully responsive, maintaining readability and usability on all screen sizes, while preserving the existing functionality and content.

### Ensuring Full Compatibility Across Desktop and Mobile

#### Overview
To achieve full compatibility, the website must adapt its layout, text width, and element sizes based on the device’s screen size. This involves using Tailwind CSS’s responsive classes (e.g., `sm:`, `md:`) to adjust navigation, text, images, charts, and videos. The goal is to ensure text is readable, layouts are intuitive, and interactive elements (e.g., Plotly charts, video) are accessible on both desktop and mobile, without stretching text too wide on large screens or cramping it on small ones.

#### Key Adjustments
1. **Text Width**: Use `max-w-md sm:max-w-lg` to limit text width to ~448px on mobile and ~512px on desktop, ensuring readability without excessive line lengths.
2. **Navigation**: Ensure the navbar is horizontal on desktop (`sm:flex-row`) and vertical on mobile (`flex-col`), with sufficient spacing to avoid overlap.
3. **Padding and Margins**: Add top padding (e.g., `pt-20 sm:pt-24`) to sections to prevent the fixed navbar from covering content.
4. **Images and Media**: Scale images (`profile.jpg`, `favicon.png`) and videos (`VortexVideo.mp4`) appropriately using responsive classes.
5. **Charts**: Ensure Plotly charts (`surface-plot`, `smile-plot`) are touch-friendly on mobile and appropriately sized for both devices.
6. **Testing**: Verify compatibility across devices using browser tools and real devices.

#### Updated Files
Below are the updated `index.html`, `style.css`, and `script.js` files, incorporating responsive design changes to ensure compatibility. These build on your provided files, focusing on text width and layout adjustments.

<xaiArtifact artifact_id="1cf815d9-547e-413b-9e8f-e9a708d65ecf" artifact_version_id="aaaee95e-50af-47c4-a9cd-dbf5516bbcba" title="index.html" contentType="text/html">
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Morgan J. Rees - Academic Portfolio</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <link rel="icon" type="image/png" href="favicon.png">
</head>
<body class="bg-gray-100 font-sans">
  <!-- Navigation -->
  <nav class="bg-blue-900 text-white p-4 fixed w-full top-0 z-10">
    <div class="container mx-auto flex flex-col sm:flex-row justify-between items-center">
      <h1 class="text-lg sm:text-xl font-bold mb-2 sm:mb-0">Morgan J. Rees</h1>
      <ul class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 text-sm sm:text-base">
        <li><a href="#home" class="hover:underline">Home</a></li>
        <li><a href="#about" class="hover:underline">About</a></li>
        <li><a href="#publications" class="hover:underline">Publications</a></li>
        <li><a href="#option-pricing" class="hover:underline">Option Pricing</a></li>
        <li><a href="#contact" class="hover:underline">Contact</a></li>
      </ul>
    </div>
  </nav>

  <!-- Home Section -->
  <section id="home" class="container mx-auto pt-20 sm:pt-24 pb-12 sm:pb-16 text-center">
    <img src="profile.jpg" alt="Morgan J. Rees" class="w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto mb-4">
    <h2 class="text-2xl sm:text-3xl font-bold mb-4">Morgan J. Rees</h2>
    <p class="text-base sm:text-lg text-gray-700 max-w-md sm:max-w-lg mx-auto">PhD Candidate in Mathematics at the University of Kent, specialising in computational modelling of topological solitons and quantitative finance. My PhD work focusses on numerical solutions and dynamics of the Abelian Higgs Model. I have conducted further research on numerical solutions for the Black-Scholes and Heston partial differential equations (PDEs) in option pricing.</p>
  </section>

  <!-- About Section -->
  <section id="about" class="bg-white pt-12 sm:pt-16 pb-8 sm:pb-12">
    <div class="container mx-auto">
      <h2 class="text-xl sm:text-2xl font-bold mb-4 text-center">About Me</h2>
      <p class="text-sm sm:text-base text-gray-700 max-w-md sm:max-w-lg mx-auto">I am a PhD candidate at the University of Kent, with a thesis on "The Solitonic Waltz: Abelian Higgs Vortex Dynamics." My research involves advanced computational modelling and numerical methods, including parallel computing with OpenMP. I have a strong background in quantitative finance, with expertise in option pricing, portfolio optimisation, and algorithmic trading, developed through professional development courses and personal projects in Python and C++.</p>
      <p class="text-sm sm:text-base text-gray-700 max-w-md sm:max-w-lg mx-auto mt-4">Education: PhD in Mathematics (2021-2025, viva pending), MSc Mathematics (First Class Honours, 2020-2021), BSc Mathematics (First Class Honours, 2017-2020), all at the University of Kent.</p>
    </div>
  </section>

  <!-- Publications Section -->
  <section id="publications" class="container mx-auto pt-12 sm:pt-16 pb-8 sm:pb-12">
    <h2 class="text-xl sm:text-2xl font-bold mb-4 text-center">Publications</h2>
    <ul class="list-disc list-inside max-w-md sm:max-w-lg mx-auto text-sm sm:text-base text-gray-700">
      <li><a href="https://doi.org/10.1103/PhysRevD.110.056050" class="text-blue-600 hover:underline">Scattering of Vortices with Excited Normal Modes, Phys. Rev. D, 110.056050 (2024)</a></li>
      <li><a href="https://doi.org/10.1103/PhysRevD.110.065004" class="text-blue-600 hover:underline">Spectral Collisions of Excited Abelian Higgs Vortices, Phys. Rev. D, 110.065004 (2024)</a></li>
      <li><a href="https://doi.org/10.1103/PhysRevD.111.105021" class="text-blue-600 hover:underline">Dynamics of Excited BPS 3-Vortices, Phys. Rev. D, 111.105021 (2025)</a></li>
      <li><a href="papers/vortex_dynamics_2025.pdf" class="text-blue-600 hover:underline">Vortex Dynamics Away From Critical Coupling</a></li>
    </ul>
  </section>

  <!-- Option Pricing and Vortex Simulations Section -->
  <section id="option-pricing" class="bg-white pt-12 sm:pt-16 pb-8 sm:pb-12">
    <div class="container mx-auto">
      <h2 class="text-xl sm:text-2xl font-bold mb-4 text-center">Option Pricing and Vortex Simulations</h2>
      <p class="text-sm sm:text-base text-gray-700 mb-8 max-w-md sm:max-w-lg mx-auto text-center">Explore my computational work in quantitative finance and vortex dynamics. The visualisations below include option pricing models using the Heston model and a simulation of excited Abelian Higgs vortices, reflecting my research in both fields.</p>
      
      <!-- 3D Surface Plot -->
      <div class="mb-12">
        <h3 class="text-lg sm:text-xl font-semibold mb-2 text-center">Heston Model: Call Option Price Surface</h3>
        <p class="text-sm sm:text-base text-gray-600 mb-4 max-w-md sm:max-w-lg mx-auto text-center">This 3D plot visualises call option prices as a function of strike price and time to maturity, computed using the Heston model's Fourier method.</p>
        <div id="surface-plot" class="w-full max-w-md sm:max-w-lg mx-auto h-80 sm:h-[600px]"></div>
      </div>

      <!-- Animated 2D Smile Plot -->
      <div class="mb-12">
        <h3 class="text-lg sm:text-xl font-semibold mb-2 text-center">Heston Model: Implied Volatility Smile Animation</h3>
        <p class="text-sm sm:text-base text-gray-600 mb-4 max-w-md sm:max-w-lg mx-auto text-center">This animated plot shows the implied volatility smile (implied volatility vs. strike price) evolving over time, highlighting the Heston model's stochastic volatility dynamics.</p>
        <div id="smile-plot" class="w-full max-w-md sm:max-w-lg mx-auto h-64 sm:h-[400px]"></div>
      </div>

      <!-- Vortex Simulation Video -->
      <div>
        <h3 class="text-lg sm:text-xl font-semibold mb-2 text-center">Excited Abelian Higgs Vortex Simulation</h3>
        <p class="text-sm sm:text-base text-gray-600 mb-4 max-w-md sm:max-w-lg mx-auto text-center">This video showcases a computational simulation of excited Abelian Higgs vortices, illustrating their dynamic behaviour as studied in my PhD research on vortex dynamics.</p>
        <div class="w-full max-w-md sm:max-w-lg mx-auto">
          <video id="vortex-video" class="w-full h-48 sm:h-64 rounded-lg shadow-md object-cover" controls>
            <source src="VortexVideo.mp4" type="video/mp4">
            <source src="VortexVideo.webm" type="video/webm">
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  </section>

  <!-- Contact Section -->
  <section id="contact" class="container mx-auto pt-12 sm:pt-16 pb-8 sm:pb-12 text-center">
    <h2 class="text-xl sm:text-2xl font-bold mb-4">Contact</h2>
    <p class="text-sm sm:text-base text-gray-700 max-w-md sm:max-w-lg mx-auto">Email: <a href="mailto:reesjmorgan@gmail.com" class="text-blue-600 hover:underline">reesjmorgan@gmail.com</a></p>
    <p class="text-sm sm:text-base text-gray-700 max-w-md sm:max-w-lg mx-auto">LinkedIn: <a href="https://www.linkedin.com/in/morgan-rees-8a5008288" class="text-blue-600 hover:underline">morgan-rees-8a5008288</a></p>
    <p class="text-sm sm:text-base text-gray-700 max-w-md sm:max-w-lg mx-auto">GitHub: <a href="https://github.com/rhesus1" class="text-blue-600 hover:underline">rhesus1</a></p>
  </section>

  <!-- Footer -->
  <footer class="bg-blue-900 text-white text-center p-4">
    <p class="text-sm sm:text-base">© 2025 Morgan J. Rees. All rights reserved.</p>
  </footer>

  <!-- Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/plotly.js@2.27.0/dist/plotly.min.js"></script>
  <script src="script.js"></script>
</body>
</html>
