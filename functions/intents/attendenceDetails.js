module.exports = {

	attendenceDetailsProcess : function(db, parameters, emailId, sendResponse){

		emailId = 'pranav.bhosale7@gmail.com'
		//initializing parameters into variables;
		let subject = parameters.subject;
		let engYear = parameters.class;
		let semester = parameters.semester;
		let ordinal = parameters.ordinal;
		let relativeDays = parameters.relativeDays;
		let currentEngYear, currentEngSem;
		let prn;
		let mail = "pranav.bhosale7@gmail.com";
		let doc;
		let semDoc;

		let sems_array = ["FE", "SE", "TE", "BE"];

		//getting prn no from email id 
		db.collection('people').doc(mail).get().
		then((snapShot) => {
				if( !snapShot.exists ){
					console.log('hhhhh');
					sendResponse("person not found sorry !");
					return;
				}
				let doc = snapShot.data();
				prn = doc.prn;
				console.log(prn);
				currentEngYear = doc.year;
				currentEngSem = doc.currentSem;
				console.log(currentEngYear);
				processFurther();
		}).
		catch( (error) => {
			console.log('catched ', error);
		})

		function processFurther(){

			db.collection('attendence').doc(prn).get().
			then( (snapShot) => {

				if( !snapShot.exists ){
				 sendResponse('negative response no doc found for this person!');
				 return;
				}
				doc = snapShot.data();
				console.log( currentEngYear, currentEngSem, doc );
				semDoc = doc[ currentEngYear.toUpperCase() ][currentEngSem];
				sendAttendence();
			})
		}

		function sendAttendence(){
			console.log( 'sending attendence' )
			if(relativeDays && relativeDays != 'this'){
				sendResponse('no !!');
				return;
			}


			if( !ordinal && ( parameters.number || parameters['number-integer'] )){
				//setting the ordinal 
				ordinal = parameters.number ? parameters.number : parameters['number-integer'];
			}

			if( !engYear ){
				if(!semester || !ordinal){
					//if no sem or year was mentioned set it default
					engYear = currentEngYear;
					ordinal = currentEngSem;
				}
				else{
					//if at least sem is defined calculate engYear 
					engYear = Math.floor( ordinal / 2 );
					engYear = sems_array[engYear - 1];
					ordinal = ordinal % 2;
					ordinal = semester ? 2 : 1;
				}
			}

			if( engYear != currentEngYear || ordinal != currentEngSem  ){
				console.log(engYear, semester);
				console.log(currentEngYear, currentEngSem);
				sendResponse('Sorry! We do not hold information of this academic year/sem');
				return;
			}

			if(!subject){
				sendResponse('Your this sems aggregate till now is ' + semDoc.aggregate);
				return;
			}
			// console.log( "95", currentEngYear.toUpperCase(), currentEngSem, semDoc )

			let currentSemDoc = semDoc
			console.log(currentSemDoc);	
			Object.keys(currentSemDoc).forEach( (key) => {
				if( currentSemDoc[key].name == subject.toUpperCase() ){
					let attendencePercentage = currentSemDoc[key].percentage;
					//heres the actual problem 
					sendResponse("Your " + subject + " attendence is " + attendencePercentage + "%\n");
					return;
				}
			})

			sendResponse("We dont have attendence info about " + subject);
			return;
		}
	}

}