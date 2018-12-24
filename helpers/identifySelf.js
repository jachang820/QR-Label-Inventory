/* Searches list of users obtained to match given email.
   Adds a 'self' attribute to the list if matched. */
module.exports = (users, my_email) => {
	var i;
	for (i = 0; i < users.length; i++) {
		if (users[i].email == my_email) {
			users[i].self = true;
		}
	}
	return users;
}