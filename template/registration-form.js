document.getElementById('registration-form').addEventListener('submit', function(e){
    const password = this.elements['password'].value;
    const confirm = this.elements['confirm-password'].value;

    if(password !== confirm){
        e.preventDefault();
        alert("Password do not match!");
        return false;
    }
})