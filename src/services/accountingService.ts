// src/services/accountingService.ts

/**
 * Sends the tool acquisition data to the backend API.
 * This triggers the double-entry accounting logic on your server.
 */
export const recordAssetAcquisition = async (toolData: any) => {
  // If you don't have a backend yet, this will fail in the browser.
  // For now, we will log it so you can see it working in the console.
  console.log("--- JOURNAL ENTRY TRIGGERED ---");
  console.log(`Debit: Assets:Equipment (Value: ${toolData.cost})`);
  console.log(`Credit: ${toolData.paymentMethod} (Value: ${toolData.cost})`);

  try {
    const response = await fetch('/api/accounting/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toolId: toolData.id,
        name: toolData.name,
        cost: toolData.cost,
        account: toolData.paymentMethod,
        timestamp: new Date().toISOString()
      }),
    });
    
    if (!response.ok) throw new Error("Journal entry failed");
    return await response.json();
  } catch (error) {
    console.warn("Backend not found. Continuing in local-only mode.", error);
  }
};