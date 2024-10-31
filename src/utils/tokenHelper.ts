export const generateOrderNumber = (length: number): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
  
    return result;
  };
  

  
export const generateToken = (length = 4) =>{
  // decallar variable 
  let otp = "";
  
  for(let i = 0; i < length; i++){
      const digit = Math.floor(Math.random() * 10)
      otp += digit
  }
  return otp;
}