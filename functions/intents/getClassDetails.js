let clsDetails;
module.exports = {

    classInfoProcess: function(db, parameters, sendResponse) {



        let dbRef = db.collection('classDetails');
        dbRef.where('year', '==', (parameters.class).toLowerCase()).where('division', '==', parameters.number + "").get()
            .then(snapshot => {
                if (snapshot.empty) {

                    sendResponse("Details not found");
                }
                snapshot.forEach(doc => {
                    clsDetails = doc.data();
                    console.log(clsDetails.subjectTeacher[parameters.subject]);
                    generateResponse(parameters, sendResponse);


                });
            })
            .catch(err => {
                console.log('Error getting documents', err);
            });


    }

}

function generateResponse(parameters, sendResponse) {
    let response = "Well I don't know that ....";
    let defineFieldsArr = getDefinedParameters(parameters);
    if ((parameters.teacher != "" && parameters.subject != "") || (parameters.subject != "" && parameters.teach != "")) { //teacher for osd subject
        if (clsDetails.subjectTeacher[parameters.subject] != undefined)
            response = "Prof " + clsDetails.subjectTeacher[parameters.subject] + " teaches " + parameters.subject;

        else
            response = "Either details not found or that class doesn't contain this subject";
    } else
    if (parameters.total != "" && parameters.student != "" || parameters.student != "" && parameters.batch == "") { //total students in te div 2
        if (clsDetails.totalStudents == undefined)
            response = "I don't have info about total students ,plz ask admin to update this info.";
        else
            response = "It has total " + clsDetails.totalStudents + " students.";
    } else
    if (parameters.classroom != "") { //where is div 4 classroom
        if (clsDetails.classroom == undefined) {
            response = "Sorry, I don't know where is your classroom,contact admin to give me these updates";
        } else {
            response = "room no. " + clsDetails.classroom;
        }
    } else
    if (parameters.batch != "" && parameters.teacherGuardian != "") {  //tg for t12 batch
        let tg = clsDetails.tg[parameters.batch];
        if (tg == undefined) {
            response = "Given batch doesn't belong to this class";
        } else {
            response = "Well I know this` Prof " + tg + " is teacher guardian for " + parameters.batch + " batch."
        }
    } else
    if (parameters.batch != "" && parameters.students != "") //students of batch t11
    {
        response = "";
        let batchName = clsDetails[parameters.batch];
        let arr = Object.keys(batchName);
        arr.sort();
        for (let key in arr) {

            response = response + " " + arr[key];
            response = response + "\n";


        }


    } else
    if (parameters.batches != "") { //all batches from te div 2
        if (clsDetails.batch == undefined)
            response = "Batch details aren't provided,please ask admin to update it."
        else {

            response = "It has"
            let batchList = clsDetails.batch;
            let arr = Object.keys(batchList);
            arr.sort();
            for (let key in arr) {

                response = response + " " + arr[key];


            }

            console.log(arr);
            response = response + " batches."
        }
    } else
    if (parameters.teacherGuardian != "") {  // al tgs for te div 2
        response = "";
        let tgList = clsDetails.tg;
        let arr = Object.keys(tgList);
        arr.sort();
        for (let key in arr) {

            response = response + " " + arr[key] + " " + tgList[arr[key]];
            response = response + "\n";

        }


    } else
    if (parameters.teacher == "faculty") {  //all teachers of te div 2
        let teachers = clsDetails.subjectTeacher;
        response = "";
        let arr = Object.keys(teachers);
        arr.sort();
        for (let key in arr) {

            response = response + " " + arr[key] + " " + clsDetails.subjectTeacher[arr[key]];
            response = response + "\n";

        }
    } else
    if (parameters.teacher != "" && parameters.teacher != "faculty") { // class teacher of te div 2
        response = clsDetails.classTeacher + " is a class teacher";
    }




    console.log(response);
    sendResponse(response);
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