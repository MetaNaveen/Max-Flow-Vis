// Queue class implementation
class Queue {

    constructor(data) {
        this.items = [];
    }

    // enqueue function 
    enqueue(element) 
    {     
        // adding element to the queue 
        this.items.push(element); 
    }
    
    // dequeue function 
    dequeue() 
    { 
        // removing element from the queue 
        // returns underflow when called  
        // on empty queue 
        if(this.isEmpty()) 
            return "Underflow"; 
        return this.items.shift();
    } 

    // front function 
    front() 
    { 
        // returns the Front element of  
        // the queue without removing it. 
        if(this.isEmpty()) 
            return "No elements in Queue"; 
        return this.items[0]; 
    }
    
    // isEmpty function 
    isEmpty() 
    { 
        // return true if the queue is empty. 
        return this.items.length == 0; 
    } 

    // printQueue function 
    printQueue() 
    { 
        var str = ""; 
        for(var i = 0; i < this.items.length; i++) 
            str += this.items[i] +" ";

        // this.items.forEach((a) => {
        //     console.log(a);
        // });

        return str;
    } 
}

// Class Node
class Node {
    constructor(data) {
        this.id = data.id.toString();
        this.position = {
            x: data.x,
            y: data.y
        };
    }
}

// Class Edge
class Edge {
    constructor(data) {
        this.id = data.id.toString();
        this.source = data.source;
        this.target = data.target;
        this.totalCapacity = data.totalCapacity ? data.totalCapacity: 1;
        this.usedCapacity = data.usedCapacity ? data.usedCapacity: 0;
        this.customLabel = this.usedCapacity + "/" + this.totalCapacity;
    }
}