document.getElementById('registration-form').addEventListener('submit', function(e){
    const adhar = this.elements['adhar-number'].value;
    const password = this.elements['password'].value;
    const confirm = this.elements['confirm-password'].value;

     if (!/^\d{12}$/.test(adhar)) {
        e.preventDefault();
        alert("Please enter a valid 12-digit Aadhar Number");
        return false;
     }

    else if(password !== confirm){
        e.preventDefault();
        alert("Password do not match!");
        return false;
    }

   else if (password<8){
        e.preventDefault();
        alert("Please enter at least 8 digit password!");
        return false;
   }

   else if(!(password.match(/[1234567890]/) && password.match(/[!@#$%&*()_+]/) && password.match(/[A-Z]/) && password.match(/[a-z]/))){
        e.preventDefault();
        alert("Please enter the strong password!");
        return false;
   }

})





