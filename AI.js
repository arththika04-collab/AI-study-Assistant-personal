function login() {
  let email = document.getElementById("email").value;
  let pass = document.getElementById("password").value;

  if (email === "" || pass === "") {
    alert("Please enter login details");
    return;
  }

  alert("Login successful!");
  window.location.href = "index.html";
}
