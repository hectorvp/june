let user;
let myTimetable;
module.exports = {


    subjectAndSyllabusInfoProcess: function(db, parameters, emailId, sendResponse) {

		/////////////////////Getting user document/////////////////////////////////
        let docRef = db.collection('people').doc(emailId);

        let getDoc = docRef.get()
            .then(doc => {
                if (!doc.exists) {
                    console.log('No such document!');
                    sendResponse('User info not found');
                } else {
                    user = doc.data();
            		console.log('users division is '+user.division+" user year"+user.year);
                    getTimetable(sendResponse, db, parameters);


                }
            })
            .catch(err => {
                console.log('Error getting document', err);
            });

    }




}

function getTimetable(sendResponse, db, parameters) {
    let collRef = db.collection('lectureSchedule');
    let query = collRef.where('year', '==', user.year).where('division', '==', user.division).get()
        .then(snapshot => {
			if (snapshot.empty) {

                    sendResponse("Timetable of your class is not available,plz ask admin to update it");
                }
            snapshot.forEach(doc => {
                 console.log(doc.id, '=>', doc.data());
                myTimetable = doc.data();
                console.log(myTimetable);
                generateResponse(parameters, sendResponse);

            });
        })
        .catch(err => {
            console.log('Error getting documents', err);
        });



}


function generateResponse(parameters, sendResponse) {
    let arr = getDefinedParameters(parameters);
    console.log('arr is ' + arr);
    let response;
    if (parameters.dayName == "Sunday" || parameters.dayName == "Saturday") {
        response = 'It\'s weekend, you have holiday';
		//monday lectures OR tommorow lectures
	} 
	else if ( (parameters.dayName != "" || parameters.relativeDays != "") && parameters.lecture != "" && arr.length == 2) {
        let day = (parameters.dayName != "")?  parameters.dayName.toLowerCase() : getDay(parameters.relativeDays);
        response = dayNameLecture(parameters, day);
		//do i have osd lecture on thursday OR do i have osd lecture on thursday
    } else if (parameters.subject != "" && (parameters.dayName != "" || parameters.relativeDays != "") && parameters.lecture != "" && arr.length == 3) {
        let day = (parameters.dayName != "")?  parameters.dayName.toLowerCase() : getDay(parameters.relativeDays);
        response = subjectLectureDay(parameters, day);
    }
	//monday practical
	else if ( (parameters.dayName != "" || parameters.relativeDays != "" ) && parameters.examType != "" && arr.length == 2) {
        let batch = user.practicalBatch;
        let day = (parameters.dayName != "")? parameters.dayName.toLowerCase() : getDay(parameters.relativeDays);
        let dayTimeTable = myTimetable[day];
        let pracList = dayTimeTable.practicals;

        let practical = pracList[batch];
        if (typeof practical == 'undefined') {
            response = "No practicals for your batch specified on " + parameters.dayName;
        } else {
            response = "You have " + practical + " practical on " + parameters.dayName;
        }
    }
	//Do i have pmcd prac on wednesday or do i have deld prac tommorow 
     else if ( (parameters.dayName != "" || parameters.relativeDays != "") && parameters.examType != "" && parameters.subject != "" && arr.length == 3) {
        let day = (parameters.dayName != "")?  parameters.dayName.toLowerCase() : getDay(parameters.relativeDays);
		response = subjectDayPractical(parameters,day);
    }
	//when are my pmcd lectures
	else if( parameters.subject != "" && parameters.lecture !="" && arr.length == 2)
	{
		let daysArr = subjectLectures(parameters);
		
		if(daysArr.length==0)
		{
			response ="Oops ,it seems you don't have this subject in current semester, so no lectures in any of these weeks";
		}
		else
		{
			response =  "You have "+parameters.subject +" lectures on"; 
			for(let i=0; i< daysArr.length ; i++ )
			{
				console.log(daysArr[i]);
				response = response+" "+daysArr[i];
			}
		}
		
		
	}
	//which is 1st lecture on monday
	else if( (parameters.dayName != "" || parameters.relativeDays != "") && (parameters.ordinal != "" || parameters.number != "") && parameters.lecture !="" && arr.length == 3)
	{
		let num = (parameters.ordinal != "")? parameters.ordinal : parameters.number ;
		console.log(num);
		let day = (parameters.dayName != "")?  parameters.dayName.toLowerCase() : getDay(parameters.relativeDays);
		let dayTimeTable = myTimetable[day];
		
		let subList = dayTimeTable.subjects;
		for(let key in subList)
		{
			if( subList.hasOwnProperty(key) )
			{
				let subj = dayTimeTable[key]; 
				if(subj.lectureNo==num)
				{
					response = "It is "+key+" lecture scheduled at "+subj.time+" "+day; //It is osd lecture scheduled at 8:15 to 9:15
				}
			}
		}
	}
	else if( (parameters.dayName != "" || parameters.relativeDays != "") && arr.length == 1 )
	{
		let day = (parameters.dayName != "")?  parameters.dayName.toLowerCase() : getDay(parameters.relativeDays);
		response = dayNameLecture(parameters,day);
		
		
	}
	else{
		let imageUrl = myTimetable.url;
		responseToUser = {};
		responseToUser.speech = "Here is your time table, take a look over it";
		responseToUser.displayText = "Here is your time table, take a look over it";
        message = {
          "imageUrl": imageUrl,
          "type": 3
        };
        messages = [message];
        responseToUser.messages = messages;
        response = responseToUser; 
		
	}
	


    sendResponse(response);

}

function subjectLectures(parameters)
{
	let days = new Array();
	days[0] = "monday";
	days[1] = "tuesday";
	days[2] = "wednesday";
	days[3] = "thursday";
	days[4] = "friday";
	let array =[];
	for(let i=0 ; i < days.length ; i++)
	{
		
		let day = days[i];
		let dayTimeTable = myTimetable[day] ;
		//console.log(myTimetable[day]);
		let subList = dayTimeTable.subjects ;
		for (let key in subList)
		{
			
			if(key == parameters.subject)
			{
				console.log(day);
				array.push(day);
			}
			
		}
	}
	return array;
	
	
}


function subjectDayPractical(parameters, day) {
	let respone,displayDay;
	if(day == 'saturday' || day == 'sunday')
	{
		return "It is weekend you have a holiday";
		}
    let batch = user.practicalBatch;
    let dayTimeTable = myTimetable[day];
	
    let pracList = dayTimeTable.practicals;
    if (parameters.relativeDays != "") {
         displayDay = parameters.relativeDays;
    } else {
         displayDay = "on " + parameters.dayName;
    }
    let practical = pracList[batch];
    if (typeof practical == 'undefined') {
        response = "No practicals for your batch specified " + displayDay;
    } else {
        if (practical.includes(parameters.subject) ) {
            response = "Yes,you have " + practical + " practical " + displayDay;
        } else {
            response = "No,you don't have " + parameters.subject + " practical " + displayDay;
        }

    }

    return response;
}




function dayNameLecture(parameters, day) {
	let response;
	if(day == 'saturday' || day == 'sunday')
	{
		return "It is weekend you have a holiday";
	}
        let dayTimeTable = myTimetable[day]; 
    if (typeof dayTimeTable == 'undefined' || typeof dayTimeTable.subjects == 'undefined') {
        return 'Unfortunately data of this day is unavailable';
    }
    let subList = dayTimeTable.subjects;
    console.log(subList);
    response = 'You\'ve got';
    for (let key in subList) {
        if (subList.hasOwnProperty(key)) {
            response = response + ' ' + key;
        }
    }
    if (parameters.relativeDays == "")
        response = response + ' lectures on ' + day;
    else
        response = response + ' lectures  ' + parameters.relativeDays;
    return response;
}



function subjectLectureDay(parameters, day) {
    let response = "";
	if(day == 'saturday' || day == 'sunday')
	{
		return "It is weekend you have a holiday";
	}
	let dayTimeTable = myTimetable[day];
    if (typeof dayTimeTable == 'undefined' || typeof dayTimeTable.subjects == 'undefined') {
        return 'Unfortunately data of this day is unavailable';
    }
    let subList = dayTimeTable.subjects;
    console.log(subList);
    let flag = false;
    for (let key in subList) {
        if (subList.hasOwnProperty(key)) {
            if (key == parameters.subject) {
                flag = true;
            }
        }
    }
    if (flag) {
        let subDetail = dayTimeTable[parameters.subject];
        let lectureNo = subDetail.lectureNo;
        let time = subDetail.time;
        if (parameters.relativeDays == "")
            response = "Yes,your lecture is scheduled on " + day + " from " + time;
        else
            response = "Yes,your lecture is scheduled " + parameters.relativeDays + " from " + time;
    } else {
        if (parameters.relativeDays == "")
            response = 'No,you don\'t have a lecture on ' + day;
        else
            response = 'No,you don\'t have a lecture ' + parameters.relativeDays;
    }
    return response;
}


function getDefinedParameters(p) {
    let array = [];
    for (let key in p) {
        if (p.hasOwnProperty(key)) {

            if (p[key] != "") {
                //console.log(p[key]);				
                array.push(key);

            }
        }
    }
    return array;
}




function getDay(relativeDay) {
    let day;
    let d = new Date().getDay();
    switch (relativeDay) {
        case 'today':
            d = (d + 0) % 7;
            break;
        case 'tommorow':
            d = (d + 1) % 7;
            break;
        case 'dayAfterTommorow':
            d = (d + 2) % 7;
            break;
        case 'yesterday':
            if (d == 0) {
                d = 6;
            } else {
                d = d - 1;
            }
            break;
        case 'dayBeforeYesterday':
            if (d == 0) {
                d = 5;
            } else if (d == 1) {
                d = 6;
            } else {
                d = d - 2;
            }
        case 'next':
            d = -1;
            break;
    }


    switch (d) {
        case -1:
            day = 'next';
            break;
        case 0:
            day = "sunday";
            break;
        case 1:
            day = "monday";
            break;
        case 2:
            day = "tuesday";
            break;
        case 3:
            day = "wednesday";
            break;
        case 4:
            day = "thursday";
            break;
        case 5:
            day = "friday";
            break;
        case 6:
            day = "saturday";
    }
    return day;

}