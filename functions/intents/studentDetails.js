let mapper = {
	personName : 'name'
}

module.exports = {

	studentDetailsProcess : function (db, parameters, sendResponse){
		console.log(parameters);
		// console.log('checking biatch');
		let uniqueStudentIdentifier = parameters.rollNo ? 'rollNo' : 'PRN';
		
		//defining details to be fetched
		let personDetails = [parameters.personDetails];
		

		if( !parameters.personDetails ){

			sendResponse( 'please request for valid contact details!' )
			return;
		}


		if(personDetails[0] == 'contact details' || personDetails[0] == 'details'){
			personDetails[0] = 'mobile';
			personDetails[1] = 'email';
		}

		console.log(personDetails);
		let studentRef = db.collection('people').where('type', '==', 'student');
		
		let students = studentRef;

		//this if-else will fetch required student docs
		if( parameters[uniqueStudentIdentifier] ){
			//if unqiue identifier is available 
			students = students.where( uniqueStudentIdentifier, '==', parameters[uniqueStudentIdentifier] );
			console.log('students', students);
		} 
		else{
			//no unique identifier
			let exceptions = ['personDetails', 'PRN', 'rollNo', 'student'];
			let filterFields = getFilterFields( exceptions, parameters );
			//if no criteria is provided for student selection
			if( isObjectEmpty(filterFields) ){
				sendResponse("Sorry ! you hav not provided criteria for student selection");
				//abort the execution 
				return; 
			}
			//fetch the documents based on required fields
			console.log('ffields',  filterFields);
			for(let key in filterFields){
				//checks if its own property filterFields
				if( !filterFields.hasOwnProperty(key) ) continue;
				
				let value = filterFields[ key ]
				console.log( 'raw value', value )

				if( key == 'personName' ){
					
					key = []

					//if only single name entity is provided, 
					//convert it into array as following code will assume its an array
					if( ! Array.isArray( value ) ) value = [ value ]
					
					for( let name of value )
						key.push( 'name.' + name.toLowerCase() )
					
					console.log( key )
					value = true
				}

				for( let keyVal of key ){
					students = students.where( keyVal , '==', value );
					console.log( keyVal )
				}
			}
		}


		if( true ){
			//if single detail is required
			let response = "Here are the details you requested\n";
			students.get().
			then( (snapShot) => {
				console.log('snapshot', typeof snapShot);
				//if no docs are fetched change the response 
				if( snapShot.empty ) response = 'there are no student records for provided criteria';
				else snapShot.forEach( (doc) => {
					console.log('document', doc.data());
					let document = doc.data();
					response += document.name.first + " " + document.name.last + "'\n'";
					console.log(personDetails);
					personDetails.forEach( (detail) => {
						response += detail +  ' : ' + document[detail] + '\n';
					})
				})
				sendResponse(response);
			})
		}
	}
}


function getFilterFields(exceptions, parameters){
	//returns only required fields and removes exceptions
	let fields = { };
	for( let key in parameters ){
		//checks if its own property and not its parents
		if( !parameters.hasOwnProperty(key) ) continue;
		//checks if non required field is encounered
		if( exceptions.includes(key) ) continue;
		//if field is empty
		if(!parameters[key]) continue;

		fields[key] = parameters[key];
	}
	return fields;
}

function isObjectEmpty(object){

	for(let key in object){
		if( !object.hasOwnProperty(key) ) continue;
		else return false;
	}
	console.log('returning true');
	return true;
}

 