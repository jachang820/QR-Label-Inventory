/* Searches list of users obtained through users api call 
   to match given email. Adds a 'self' attribute to the 
   list if matched. */
module.exports = (users, my_email) => {
	for (let i = 0; i < users.length; i++) {
		if (users[i].email == my_email) {
			users[i].self = true;
			break;
		}
	}
	return users;
}