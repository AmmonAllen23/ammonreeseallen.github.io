function checkPattern() {
    const string1 = document.getElementById("string1").value;
    const string2 = document.getElementById("string2").value;
    const result = string1.includes(string2);
    document.getElementById("result").textContent = result
      ? "Pattern Found!"
      : "Pattern Not Found!";
  }