const User =function (data) {
	this.data = data;
	this.errors = [];
}

User.prototype.validateUserInput = function(){
    const emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	if(emailRegexp.test(this.data.userID)){
		if("user_type" in this.data)
		{
			if(this.data.user_type == 'W' || this.data.user_type == 'P'){
				if("phone_number" in this.data){
					if(/^\d+$/.test(this.data.phone_number)){

					}else{
						this.errors.push("phone number should only contain digits");
					}
				}
			}else{
				this.errors.push("user_type is wrong");
			}
		}
	}else{
		this.errors.push("ID is not email");
	}
}


module.exports = User;