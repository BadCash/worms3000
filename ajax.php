<?php


	$request = $_SERVER['REQUEST_METHOD'] == 'GET' ? $_GET : $_POST;
	$method = isset($_POST['method']) ? $_POST['method'] : isset($_GET['method']) ? $_GET['method'] : null;

	
	
	
	
	/**
	 * Get all highscores from highscores.txt
	 *
	 * Highscores are stored TAB-delimited, like this:
	 *
	 * TIME<tab>NAME<tab>SCORE<newline>	
	 *
	 **/
	function getHighscores(){
		$result = array();
		
		$text = @file_get_contents('highscores.txt');
		
		// Make sure the file read went well
		if( $text !== false ){
			$rows = explode( "\n", $text );
			
			foreach( $rows as $row ){
				$cols = explode( "\t", $row );
				
				// Make sure we have three columns, otherwise skip this one
				if( count($cols) != 3 ){
					continue;
				}

				$result[] = array(	
								'time'	=>	$cols[0],
								'name'	=>	$cols[1],
								'score'	=>	$cols[2]
							);
				
				// Maintain an array with the same keys as $result but only containing the score,
				//	to make it easy to use array_multisort later on to sort based on score
				$score[] = $cols[2];
			}
							
			/* Sort $result based on $score
				It may seem odd to sort the items in ascending order - we want them to be displayed in descending order
				in the highscore screen! But we do this because it's easier to add new highscore items to the table
				directly underneath the header row, so we want to add the one with the lowest score first and the
				one with the highest score last */
			if( !isset($result[0][2]) ){
				array_multisort( $score, SORT_ASC, SORT_NUMERIC, $result );
			}
		}
		
		return array( 'status' => 'success', 'message' => 'Returned highscores', 'highscores' => $result );
	}
	
	
	
	/**
	 * Store a new score in highscores.txt
	 *
	 * Highscores are stored TAB-delimited, like this:
	 *
	 * TIME<tab>NAME<tab>SCORE<newline>	
	 *
	 **/
	function sendHighscore($data){
		// Validate incoming data
		if( !isset($data['name']) or 
			!isset($data['score']) or
			!ctype_alnum($data['name']) or 
			!is_numeric($data['score']) ){
				return array( 'status' => 'error', 'message' => 'sendHighscores received bad data', 'data' => $data );
		}
		
		$timeStr = date('Y-m-d H:i:s');
		$text = "{$timeStr}\t{$data['name']}\t{$data['score']}\n";
		$fileResult = @file_put_contents('highscores.txt', $text, FILE_APPEND);
		
		if( $fileResult === false){
			return array( 'status' => 'error', 'message' => 'Error when writing to file' );
		}
		else{
			return array( 'status' => 'success', 'message' => "Wrote {$fileResult} bytes to file" );
		}
		
	}
	
	
	if( $method == 'getHighscores' ){
		$response = getHighscores();
	}
	elseif( $method == 'sendHighscore' ){
		$response = sendHighscore($request);
	}
	else{
		$response = array( 'status' => 'error', 'message' => 'Method not found' );
	}
	
	
	
	
	echo( json_encode($response) );
