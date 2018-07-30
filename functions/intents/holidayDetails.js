module.exports = {
  
  holidaysProcess : function(db, parameters, sendRespone){
    console.log(parameters);
    
    //setting current time date
    let dateTime = new Date();
    let date = dateTime.getDate();
    let month = dateTime.getMonth();
    let day = dateTime.getDay();
    //experimenting
    //month = 0; date = 19; day = 0;
    let weekEnd = date + 6 - day;
    
    let months = ["january", "february", "march", "april", "may", "june", "july", "september", "octomber", "november", "december"];
    let days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    
    //parameters then database ref
    let periodType = parameters.periodType; //may hold value week, month, january, february......
    let timeOffset = parameters.relativeDays;
    let holidaysRef = db.collection('holidays');
    if(!timeOffset) timeOffset = 'this'; // if no time offset is given set it to this 
    //respone text
    let response = "";
   
    if(!periodType || periodType == 'week' ){
      periodType = 'week';
      timeOffset = 'this'; //can only show this week's holidays 
      response = "Here is the list of this upcoming holidays\n";
      holidaysRef = holidaysRef.doc(months[month]).collection('holidayList'); //filtered by month
      holidaysRef = holidaysRef.where('date', '>=' , date).where('date', '<=', weekEnd); //week filtering
    }
    //if period type month
    else{
      
      if(periodType == 'month'){
        //if there is time offset (next month, prev month)
        if(timeOffset && timeOffset != 'this'){  
          if(month === 0 || month === 11) {
            //if requested info of previous years or next years month, return 
            sendRespone("Sorry !! We do not hold holiday information of requested month\n");
            return;
          }
          //otherwise get the requested month
          month += timeOffset == 'next' ? 1 : -1;
        }
       
        response = "Here are the holidays of " + timeOffset + " month\n";
        holidaysRef = holidaysRef.doc(months[month % 12]).collection('holidayList');
      }
      //if asked for specific month
      else{
//         timeOffset = ""; //do not hold timeOffset constain
        holidaysRef = holidaysRef.doc(periodType).collection('holidayList');
        response = "Here are the holidays of " + periodType + "\n";
      }
    }
    
    holidaysRef.get().
      then( (snapShot) => {
        console.log('got the snapshot');
        
        if( snapShot.empty ) response = "You do not have any holidays " + timeOffset + " " + periodType + "\n";
        else snapShot.forEach((doc) => {
          doc = doc.data();
          console.log('1\n');
          response += doc.date + " / " + doc.day + " : " + doc.name + "\n";
          console.log(response);
        })
          sendRespone( response )
        // sendRespone(response+" ` Do you wanna if you could take one consecutive day off or not ? ");
      })
  }
}