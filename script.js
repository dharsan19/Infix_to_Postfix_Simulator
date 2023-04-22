paper.install(window)    
paper.setup('myCanvas')

/***************   Visual Part initializations *************/
fr = {'b': 240, 'u':10, 'l':30, 'p':57, 'w':70} // bottom, up, left, text position, width

/******  User defined array Functions *******/
Array.prototype.last = function(){
	return this[this.length - 1];
};

Array.prototype.clone = function() {
	return this.slice(0);
};

var operators = {'+':1, '-':1, '*':2, '/':2};
var iterNo = 0;
var forwardTimeout = null;

window.backward = function(){
  if(iterNo <= 0)
    return
    
  clearTimeout(forwardTimeout);  
    
  update(--iterNo);
}

function update(iterNo){
   showStack(changes[iterNo].stack);
   document.getElementById('result_exp').value = changes[iterNo].output;   
   document.getElementById("info_iter").innerHTML = "Iterations:  "+ iterNo;
   document.getElementById("desc").innerHTML = changes[iterNo].desc;
}

function next(){
    if(iterNo >= changes.length-1){
      clearTimeout(forwardTimeout);  
      return;
    }
    update(++iterNo);
}

window.iterate = function(){
    if(iterNo >= changes.length-1)
      return
      
    clearTimeout(forwardTimeout);   
    next();
}

window.evaluate = function(){	
  iterNo = 0;
  clearTimeout(forwardTimeout);   

	infix = document.getElementById("expression").value;

  changes = infix2postfix(infix).changes;
  
  document.getElementById('result_exp').value = ''
  document.getElementById("info_iter").innerHTML = "Iterations:  "+ iterNo;

  function loop(){
    next();
    forwardTimeout = setTimeout(function(){
      loop();          
    }, 2000);
  }
  setTimeout(loop, 1000); // loop will start 1 second later 
}
window.evaluate();


function isALetter(charVal)
{
    if( charVal.toUpperCase() != charVal.toLowerCase() )
       return true;
    return false;
}

var operators = {'+':1, '-':1, '*':2, '/':2};

function infix2postfix(infix){
	var stack = []
  var changes = [{'stack':[], 'output':[], 'desc':''}] // it is for visual purpose
	var output = ''
	
	for(var i=0; i < infix.length; i++){
		var char = infix[i];
		
		if(isALetter( char )){
      changes.push({'stack':stack.clone(), 'output':output, 'desc':'read letter \''+char+'\' and output'})
			output += char;
    }
		else if( char == '('){
      changes.push({'stack':stack.clone(), 'output':output, 'desc':'read \'(\' and push to stack'})
		  stack.push(char)
    }
		else if(operators[char] > 0)
		{	
			if(stack.length == 0 || operators[char] > operators[stack.last()]){ // higher precedence compared to stack, push it
        changes.push({'stack':stack.clone(), 'output':output, 'desc':'read operator \''+char+'\' and push to stack'})
        stack.push(char)
      }
			else{
				while( operators[char] <= operators[stack.last()] ) { // as long as lower or equal prec. compared to stack, pop it
          changes.push({'stack':stack.clone(), 'output':output, 'desc':'read operator\''+char+
                        '\'<br>exists higher or equal precedence operator \''+stack.last()+'\' pop it and output'})
          output += stack.pop();
        }

				stack.push(char)
			}
		}
		else if( char == ')')
		{
        changes.push({'stack':stack.clone(), 'output':output, 'desc':'read \')\' and pop from stack until \'(\''})
      
				while( stack.last() != '(' ) // as long as lower or equal prec. compared to stack, pop it
					output += stack.pop()	
			
				stack.pop()
		}
    else if( char == ' ')
      continue;
    
    //changes.push({'stack':stack.clone(), 'output':output})
	}
	while(stack.length > 0) // remaining items in stack will be automatically outputted
  {
    changes.push({'stack':stack.clone(), 'output':output, 'desc': 'Input is empty, pop all until stack is empty'})
    output += stack.pop()
  }

  changes.push({'stack':stack.clone(), 'output':output, 'desc': 'Finished!'})
	return {'changes':changes};
}

function putFrame(){
    /***** Show the outer frame *******/
  var frame = new Path({strokeColor:'black', strokeWidth:3});
  frame.add( [fr.l, fr.u], [fr.l, fr.b], [fr.l + fr.w, fr.b], [fr.l + fr.w, fr.u]);
  new PointText({ position: [fr.l + 10, fr.b + 30], fontSize: '20px', content:'Stack'});
  view.update();
}
putFrame();

function showStack(stack){
  paper.setup('myCanvas')
  putFrame();

  for(var i=0; i < stack.length; i++){
    new PointText({ position: [fr.p, fr.b - 10 - 40*i], fontSize: '30px', content:''+ stack[i]});
    new Path.Line({from: [fr.l, fr.b - 40*i], to: [fr.l + fr.w, fr.b - 40*i], strokeColor: 'black', strokeWidth:2});
  }
  view.update();
}