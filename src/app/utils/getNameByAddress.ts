export const getStoredSigners = () => {
  const storedSigners = localStorage.getItem("signers");
  if (storedSigners) {
    return JSON.parse(storedSigners);
  }
  return [];
};
// Utility function to get the name by passing an address
export const getNameByAddress = (address: string) => {
  const storedSigners = getStoredSigners();
  const signer = storedSigners.find(
    (s: { name: string; address: string }) => s.address === address
  );
  return signer ? signer.name : "";
};
