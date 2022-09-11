function oddishOrEvenish(num) {
  var str = num.toString();
  var sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += parseInt(str[i]);
  }
  if (sum % 2 == 0) {
    console.log("Even");
    return "Even";
  } else {
    console.log("Odd");
    return "Odd";
  }
}
