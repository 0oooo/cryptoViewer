async function sayHello (name:string, waitTime:number){
    let promise = new Promise((resolve, reject) =>
        setTimeout(() => {
            console.log("End of timeout: ");
            resolve(`Hello ${name}`);
            reject(`Error in the timeout`);
        }, waitTime)
    );


    try {
        let result = await promise;
        console.log(result);
    }catch(exception){
        console.log(exception);
    }
}

sayHello("Camille", 2000);

// create two promises and put them in a third function

let getData = async (name:string)  =>  {
    return new Promise ( (resolve, reject) => {
        setTimeout(() => {
            console.log("Timeout for get Data done.");
            name === "Camille" ? resolve("Master") : resolve(`Newbie ${name}`)

        }, 2000);
    });
}

let setData = async (status:string) => {
    return new Promise ((resolve, reject) => {
        setTimeout(() => {
            console.log("Timeout for set Data done.");
            resolve(`${status} put in database`);
        }, 2000);
    });
}

let dealWithData = async (name:string) => {
    try{
        let newName = <string> await getData(name); // casting
        console.log(newName);
        setData(newName);
    }catch(exception){
        console.log(exception);
    }
}

dealWithData("Camille");