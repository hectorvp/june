module.exports = {

    personDetailsProcess: function (db, parameters, userEmail, sendResponse) {

      let personName = parameters.personName;
	  	let personDetails = parameters.personDetails;
      let email = parameters.email;
	  	let firstName = "first";
	  	let lastName = "last";
	  	let peopleRef = db.collection('people');
      let recordsRetrieved = [];

	  	if(personName.length == 0) {
	  		if (email != "") {
          let query = peopleRef.where('email', '==', email);
          return executeQueryUsingEmail(query, recordsRetrieved, personDetails, sendResponse);
        }
        else if(userEmail !== null) {
          let query = peopleRef.where('email', '==', userEmail);
          return executeQuery(query, recordsRetrieved, personDetails, sendResponse);
        }
        else {
          sendResponse('Sorry, I am not undertanding what you want`Can you try something different');
        }
	  		return;
	  	}

	  	firstName = personName[0];
      firstName = firstName.toLowerCase();
	  	if(personName.length > 1) {
	  		lastName = personName[1];
        lastName = lastName.toLowerCase();
	  	}

    	if(personName.length == 1) {
    		//only first name given
    		return personFirstName(peopleRef, firstName, sendResponse, personDetails, recordsRetrieved);
    	}
    	else if(personName.length == 2) {
    		//first name last name given
    		return personFirstNameLastName(peopleRef, firstName, lastName, sendResponse, personDetails, recordsRetrieved);
    	}
    	else {
    		sendResponse("Oops! no person details and name :(");
    	}
	}
}

function executeQueryUsingEmail(query, recordsRetrieved, personDetails, sendResponse) {
  return query.get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    let record = doc.data();
                    recordsRetrieved.push(record);
                    console.log(record);
                });

                generateResponse(recordsRetrieved, personDetails, sendResponse);
            })
            .catch(err => {
            console.log("error getting docs, in executeQuery");
          });
}

function executeQuery(query, recordsRetrieved, personDetails, sendResponse) {
  return query.get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    let record = doc.data();
                    recordsRetrieved.push(record);
                    console.log(record);
                });

                generateResponseForPersonalQuery(recordsRetrieved, personDetails, sendResponse);
            })
            .catch(err => {
            console.log("error getting docs, in executeQuery");
          });
}

function generateResponseForPersonalQuery(recordsRetrieved, personDetails, sendResponse) {
  let record = recordsRetrieved[0];
  let response = "";
    if(personDetails.length != 0) {
        if(personDetails[0] == "contact details" || personDetails.length == 2) {
          response = "Your mobile no is " + record.mobile + " and email is "+ record.email;
        }
        else if(personDetails[0] == "details") {
          response = JSON.stringify(record);
        }
        else if(personDetails[0] == "mobile") {
          response = "Your mobile no is " + record.mobile;
        }
        else if(personDetails[0] == "email") {
          response = "Your email id is " + record.email;
        }
        else {
          response = "Sorry I can't find what you want`Please try something else";
        }
    }
    else {      
        response += "You are " + record.name.first + " " + record.name.last;
    }
    sendResponse(response);
}

function queryLastName(peopleRef, name, personDetails, recordsRetrieved) {
	return peopleRef.where('name.last', '==', name).get()
    				.then(snapshot => {
        				snapshot.forEach(doc => {
           					let record = doc.data();
           					recordsRetrieved.push(record);
           					console.log(record);
        				});
    				})
    				.catch(err => {
    				console.log("error getting docs, in queryLastName");
    			});
}

function personFirstName(peopleRef, firstName, sendResponse, personDetails, recordsRetrieved) {
	return peopleRef.where('name.first', '==', firstName).get()
    			.then(snapshot => {
    				console.log("snapshot length: " + snapshot.size);

        			snapshot.forEach(doc => {
           				let record = doc.data();
           				recordsRetrieved.push(record);		//record pushed
           				console.log(record);
        			});
        			//if name equals last name
       				queryLastName(peopleRef, firstName, personDetails, recordsRetrieved).then(
       						() => {
       							generateResponse(recordsRetrieved, personDetails, sendResponse);
       						})
       						.catch(err => {
       							console.log("error performing last name query");
       						});
    			})
    			.catch(err => {
    				console.log("error getting docs");
    			});
}

function personFirstNameLastName(peopleRef, firstName, lastName, sendResponse, personDetails, recordsRetrieved) {
	return peopleRef.where('name.first', '==', firstName).where('name.last', '==', lastName).get()
    			.then(snapshot => {
        			snapshot.forEach(doc => {
           				let record = doc.data();
           				console.log(record);
           				recordsRetrieved.push(record);
        			});
        			//querying lastName firstName
       				personLastNameFirstName(peopleRef, firstName, lastName, recordsRetrieved).then(
       						() => {
       							generateResponse(recordsRetrieved, personDetails, sendResponse);
       						})
       						.catch(err => {
       							console.log("error performing whoIsLastNameFirstName query");
       						});
    			})
    			.catch(err => {
    				console.log("error getting docs");
    			});
}

function personLastNameFirstName(peopleRef, firstName, lastName, recordsRetrieved) {
	return peopleRef.where('name.first', '==', lastName).where('name.last', '==', firstName).get()
    				.then(snapshot => {
        				snapshot.forEach(doc => {
           					let record = doc.data();
           					console.log(record);
           					recordsRetrieved.push(record);
        				});
    				})
    				.catch(err => {
    				console.log("error getting docs, in queryLastName");
    			});
}

function generateResponse(recordsRetrieved, personDetails, sendResponse) {
	console.log(recordsRetrieved);
	let response = "";
	if(recordsRetrieved.length == 1) {
		let record = recordsRetrieved[0];
		if(personDetails.length != 0) {
				if(personDetails[0] == "contact details" || personDetails.length == 2) {
					response = record.name.first + " " + record.name.last + "'s mobile no is " + record.mobile + " and email is "+ record.email;
				}
				else if(personDetails[0] == "details") {
					response = JSON.stringify(record);
				}
				else if(personDetails[0] == "mobile") {
					response = record.name.first + " " + record.name.last + "'s mobile no " + record.mobile;
				}
				else if(personDetails[0] == "email") {
					response = record.name.first + " " + record.name.last + "'s email id is " + record.email;
				}
				else {
					response = "Invalid query";
				}
		}
		else {
			response += record.name.first + " " + record.name.last + " is a " + record.type;
			if(record.type == "student") {
				response += " of " + record.year + " division " + record.division;
			}
			else {
				//teacher of class
			}
		}
    response = addExtraResponse(record.type, response);
	}
  else if(recordsRetrieved.length == 0)
    response += "Sorry I can't find what you are looking for`Please try something else";
	else {
			response += "Which person you are talking about?`";

      for(let i = 0; i < recordsRetrieved.length; i++) {
        let rec = recordsRetrieved[i];
        response += rec.name.first + " " + rec.name.last + " is a " + rec.type;
        if (rec.type == 'student') {
          response += " of " + rec.year + " division " + rec.division;
        }
        response += " " + rec.email;
        if(i != recordsRetrieved.length - 1) {
          response += "\n";
        }
      }
	}
	sendResponse(response);
}

function addExtraResponse(personType, response) {
  if(personType === 'student')
    return response;

  let currentDate = new Date();

  let newResponse = response;
  if(currentDate.getHours() > 20) {
    newResponse += "`This doesn't seem right time to contact. Consider sending a text message instead."
  } else {
    let day = currentDate.getDay();
    if (day == 0 || day == 1)
      return newResponse;

    //calculate teachers time
  }
}