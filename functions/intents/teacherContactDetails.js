

module.exports = {

    teacherContactDetailsProcess: function (db, parameters, sendResponse) {
    	console.log('deployed');
	  	let personName = parameters.personName;
	  	let personDetails = [parameters.personDetails];
		let response = 'Here are the requested teacher details\n';

		if( !personDetails ){
			sendResponse('requested for invalid details!!!');
			return;
		}

		if(personDetails[0] == 'contact details' || personDetails[0] == 'details'){
			personDetails[0] = 'mobile';
			personDetails[1] = 'email';
		}

		// anyways firstname and lastname has been declared to null by default.
		
		if(!personName || personName.length == 0) {
			sendResponse('invalid teacher name !!!');
			return;
		}
		
		let teacherRef = db.collection('people').where('type','==','teacher');

		personName.forEach( (name) => {
			let tempName = 'name.' + name;
			teacherRef = teacherRef.where( tempName, '==', true);
		})

		teacherRef.get()
    		.then(snapshot => {
    			if(snapshot.empty) response = 'No teacher of given name has been found\n';
        		snapshot.forEach(doc => {
        			console.log('1');
           			let record = doc.data();
		            response += record.name.first + " " + record.name.last + "\n";

		            personDetails.forEach( (detail) => {
		            	response += detail + ':' + record[detail] + "\n";
		            })
        		});
        		sendResponse(response);
    		})
    		.catch(err => {
        	console.log('Error getting documents', err);
    	});
	}
}


// Things that should be added in index.js
// const TeacherContactDetails = require('./intents/getTeacherContactDetails.js');
/*

//teacher contact details intent
    'getTeacherContactDetails': () => {
    	TeacherContactDetails.teacherContactDetailsProcess(db, parameters, function(res){
    		sendResponse(res);
    	});
    },

*/
