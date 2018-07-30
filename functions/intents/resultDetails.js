		let positiveResponses = [];
		let negativeResponses = [];
		let borderResponses = [];

		positiveResponses[0] = "Your aggreagte is good. Maintain it.";
		positiveResponses[1] = "Nice.";
		positiveResponses[2] = "You have done it. Keep it up.";

		negativeResponses[0] = "You need to take this seriously.";
		negativeResponses[1] = "Looks are you might miss placement opportunity with this.";
		negativeResponses[2] = "You still have time. Make every day count.";

		borderResponses[0] = "You can save yourself. Just Few More days & nights of study.";
		borderResponses[1] = "You have made so far. Push yourself  bit to go just above 66% ";
		borderResponses[2] = "Try to win all your marks in practicals.";

function getRandomInt(max) {
	 return Math.floor(Math.random() * Math.floor(max));
}
module.exports = {
	resultDetailsProcess : function(db, parameters, emailId,sendResponse){

		//parameters
		console.log(emailId);
		let timePeriod = parameters.semester; //determines whether to check for sem or year
		let engYear = parameters.class; //FE be te 
		let ordinal = parameters.ordinal; //1 for 1st , 2 for 2nd
		let year = parameters.year; //checks presence of word entity year
		let sem = parameters.semester;
		let timeOffset = parameters.relativeDays;
		let resultType= parameters.result;
		// let year = parameters.year;
		let mail = 'pranav.bhosale7@gmail.com';		
		let prn;
		let current_year;
		let result;
		let response = "heres the result\n";
		//db connection	
		let resultRef;
		
		
		
		//helping data structure 
		let sems_array = ["FE", "SE", "TE", "BE"];
		
		//overwriting ordinal if any of number exists 
		if(parameters.number) ordinal = parameters.number;
		if(parameters['number-integer']) ordinal = parameters['number-integer'];
		
		//uppercasing


		//getting prn no from email id 
		db.collection('people').doc(mail).get().
		then((snapShot) => {
				if(snapShot.empty) {
					sendResponse("no records found !!");
					return;
				}
				let doc = snapShot.data();
				prn = doc.prn;
				console.log(prn);
				current_year = doc.year;
				console.log(current_year);
				processFurther();
				
		})

	
		function processFurther(){
			resultRef = db.collection('results').doc(prn).get().
			then((snapShot) => {
				result = snapShot.data();
				// console.log('snapSot', snapShot);
				// console.log('got result', result);
				sendResult();
			});
		}

		function sendResult(){
			console.log('gonna send result');
// 			sendResponse("testing response !!");
// 			return;
			console.log('ordinal', ordinal);

			//if only aszked for aggregate 
			if( resultType == 'aggregate' ){
				console.log('sending total aggregate');
				// sendResponse("your average aggregate is " + result['aggregate'] + "%.");

				// getRandomInt(n) //produces random number from 0 to specified n;
				let aggregateVal
				console.log( engYear, sem )
				if( ! engYear && !sem ) aggregateVal = result[ 'aggregate' ] 
			    else if( engYear  && !sem )  aggregateVal = result[ engYear.toUpperCase() ]['aggregate'];
				else if( engYear && sem && ordinal  ) aggregateVal = result[ engYear.toUpperCase() ][ ordinal  ]['aggregate'];
				else {
					sendResponse("Please specify engineering year !!");
					return;
				}
				console.log('101', aggregateVal)
				if(aggregateVal >= 55 && aggregateVal <= 66)
				{
					sendResponse("your average aggregate is " + aggregateVal +". ` "+borderResponses[getRandomInt(3)]);
				}
				
				if(  aggregateVal  <= 60)
				{
					sendResponse("your average aggregate is " + aggregateVal +". ` "+negativeResponses[getRandomInt(3)]);
				}
				
				if(aggregateVal  >= 70)
				{
					sendResponse("your average aggregate is " + aggregateVal +". `"+positiveResponses[getRandomInt(3)]);
				}

				return;

			}

		
			if(!engYear && !sem) engYear = current_year.toUpperCase();
			else if(!engYear && ordinal && sem){
				console.log('adjusting the sems');
				let temp_year_holder_int = Math.floor(ordinal / 2);	 //holds engyear in int format starting from 0 to 3;
				if(!ordinal % 2) temp_year_holder_int--; //adjustements for sems to get perfect years
				engYear = sems_array[temp_year_holder_int]; //engyear has been determined;
				//noew determining ordinal
				ordinal = ordinal % 2;
				if(!ordinal) ordinal = 2; //adjusting 
				console.log('completed adjusting')
			}
			console.log("some info", ordinal, engYear);
			if(engYear){
				//by year fe be se
				engYear = engYear.toUpperCase(); 
				let sem_result = result[engYear];
					
				if(!sem_result){
					//if engYear result is not available
					sendResponse("no record found for this year!!");
					return;
				}
				console.log('found sem result', sem_result);

				if(sem){
						//for 1st and 2nd sem within fe be se te
						if(!ordinal) ordinal = 1;
						if(ordinal && ordinal > 2 && ordinal < 0){
							//if request is invalid
							console.log('requesting for invalid sem', ordinal);
							// console.log(result);
							sendResponse("you are requesting for invalid semester!!");
							return;
						}

						sem_result = sem_result["" + ordinal]; // ordinal 1st 2nd 
						console.log('checking', sem_result);
						if(!sem_result){
							//if sem result is not available
							console.log('requesting for valid sem', ordinal);
							// console.log(result);
							sendResponse("!!!");
							return;
						}
						//if result is found
						addResult(sem_result);
				}
				else{
						
						if(resultType != 'aggregate'){
							//all subject results wanted
							response += "sem one\n";
							addResult( sem_result["1"]); //adding sem one result
						
							if( sem_result["2"] ){
									response += "sem two\n";
									addResult(sem_result["2"]); // added second sem result if available
							}
						}
						response += "overall aggregate : " + sem_result['aggregate'];
				}
				console.log('sending result');
				// console.log(response);
				sendResponse(response);
				return;
			}

			function addResult(sem_result_param){

				if(resultType == 'aggregate'){
					//adding sem aggregate not overall 
					response = 'aggregate : ' + sem_result_param['aggregate']; 
				}

				let keys = ["sub1", "sub2", "sub3", "sub4", "sub5" ];
				let name, marks;
				keys.forEach( (key) => {
					name = sem_result_param[key]['name'];
					marks = sem_result_param[key]['marks'];
					// console.log(name, marks);
					response += name + ":" + marks + " ";
				})
				// console.log('res0', response);
				response += "\n";
			}	
		}		
	}
}



