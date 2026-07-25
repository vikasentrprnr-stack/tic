// This worker runs completely isolated from the UI thread

self.addEventListener("message", (event) => {
    const { datasetA, datasetB } = event.data;
    
    if (!datasetA || !datasetB || datasetA.length !== datasetB.length) {
      self.postMessage({ error: "Invalid datasets for correlation matrix." });
      return;
    }
  
    // Calculate Pearson Correlation Coefficient locally
    const n = datasetA.length;
    let sumA = 0, sumB = 0, sumAB = 0, sumA2 = 0, sumB2 = 0;
  
    for (let i = 0; i < n; i++) {
      const a = datasetA[i];
      const b = datasetB[i];
      sumA += a;
      sumB += b;
      sumAB += a * b;
      sumA2 += a * a;
      sumB2 += b * b;
    }
  
    const numerator = (n * sumAB) - (sumA * sumB);
    const denominator = Math.sqrt(((n * sumA2) - (sumA * sumA)) * ((n * sumB2) - (sumB * sumB)));
    
    const correlation = denominator === 0 ? 0 : numerator / denominator;
  
    // Simulate heavy ML processing delay for demo purposes
    setTimeout(() => {
      self.postMessage({ 
        correlation: correlation.toFixed(4),
        insight: correlation > 0.7 
          ? "Strong positive correlation detected." 
          : correlation < -0.7 
          ? "Strong inverse correlation detected." 
          : "No significant correlation."
      });
    }, 1000);
  });