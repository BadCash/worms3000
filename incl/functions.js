
window.My = ( function(window, document, undefined ) {
	var My = {};
  
	/**
	* Return a random integer between (and including) min and max
	**/
	My.random = function(min, max){
		return Math.round( min + (Math.random() * (max-min)) );
	};
	
	/**
	* Return a random float between (and including) min and max
	**/
	My.randomFloat = function(min, max){
		return min + (Math.random() * (max-min));
	};

	return My;
})(window, window.document);