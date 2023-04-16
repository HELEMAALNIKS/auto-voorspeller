import { DecisionTree } from "./libraries/decisiontree.js"
import { VegaTree } from "./libraries/vegatree.js"

//
// DATA
//
const csvFile = "./data/car_data.csv"
const trainingLabel = "Purchased"  
const ignored = ["User ID"]  
let amountCorrect = 0
let totalAmount = 0
let decisionTree

//
// laad csv data als json
//
function loadData() {
    Papa.parse(csvFile, {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: (results) => {
            // console.log(results.data)
            trainModel(results.data)
                    }
    // gebruik deze data om te trainen
    })
}

//
// MACHINE LEARNING - Decision Tree
//
function trainModel(data) {
    // todo : splits data in traindata en testdata

    data.sort(() => (Math.random() - 0.5));

    let trainData = data.slice(0, Math.floor(data.length * 0.8))
    let testData = data.slice(Math.floor(data.length * 0.8) + 1)

    // maak het algoritme aan
    decisionTree = new DecisionTree({
        ignoredAttributes: ignored,
        trainingSet: trainData,
        categoryAttr: trainingLabel
    })

    // let json = decisionTree.stringify()
    // console.log(json)

    // Teken de boomstructuur - DOM element, breedte, hoogte, decision tree
    let visual = new VegaTree('#view', 800, 400, decisionTree.toJSON())


    // todo : maak een prediction met een sample uit de testdata
    predictAll(testData)



    // todo : bereken de accuracy met behulp van alle test data
    calculateAccuracy()


}

function predictAll(testData){
    amountCorrect = 0
    totalAmount = testData.length

    let isMale = 0
    let isFemale = 0
    let predictedWrongMale = 0
    let predictedWrongFemale = 0


    for (const testPerson of testData) {
        let personWithoutLabel = Object.assign({}, testPerson)
        delete personWithoutLabel.Purchased
        // console.log(personWithoutLabel)

        let prediction = decisionTree.predict(personWithoutLabel)
        // console.log(prediction)

        if (prediction == testPerson.Purchased) {
            amountCorrect++
            if (prediction == "Female"){
                isFemale++
            } else if (prediction == "Male"){
                isMale++
            }

        }

        if (prediction == "Male" && testPerson.Purchased == "Female") {
            predictedWrongFemale++
        } else if (prediction == "Female" && testPerson.Purchased == "Male") {
            predictedWrongMale++
        }

    }
    // showMatrix(isMale,isFemale,predictedWrongMale,predictedWrongFemale)
}

function calculateAccuracy(){
    //bereken de accuracy met behulp van alle test data
    let accuracy = amountCorrect / totalAmount

    let accuracyHTML = document.getElementById("accuracy")
    accuracyHTML.innerHTML = `Accuracy is ${accuracy}`
}

// function showMatrix(isMale,isFemale,predictedWrongMale,predictedWrongFemale){
//     document.getElementById("total").innerHTML = totalAmount+" tested in total."
//     document.getElementById("total-correct").innerHTML = amountCorrect+" predicted correctly!"
//     document.getElementById("actual-poison").innerHTML = isMale
//     document.getElementById("actual-no-poison").innerHTML = isFemale
//     document.getElementById("predicted-wrong-no-poison").innerHTML = predictedWrongMale
//     document.getElementById("predicted-wrong-poison").innerHTML = predictedWrongFemale

// }


loadData()


let form = document.forms['model']; 
 
const element = document.getElementById("button");
element.addEventListener("click", loadSavedModel);

function loadSavedModel() {
    fetch("./model.json")
        .then((response) => response.json())
        .then((model) => modelLoaded(model))
}

function modelLoaded(model) {
    let decisionTree = new DecisionTree(model)

    let gender = document.getElementById('Gender').value;
    let age = document.getElementById('ageSlider').value;
    let annualSalary = document.getElementById('salarySlider').value;
    console.log(gender);

    // test om te zien of het werkt
    let mushroom = { Gender: gender, Age: age, annualSalary: annualSalary }
    let prediction = decisionTree.predict(mushroom)
    console.log(prediction);


    if (prediction == "1") {
        var predictionText = "een auto kopen!"
    } else {
        var predictionText = "geen auto open"
    };
    document.getElementById("prediction").innerHTML = "Deze persoon wil waarschijnlijk " + predictionText;
    // console.log("predicted " + predictionText);


}