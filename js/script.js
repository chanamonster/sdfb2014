$(document).ready(function() {
	$("#onenode").tooltip({placement: 	'right', title: 'The connections of one individual'});
	$("#twonode").tooltip({placement: 	'right', title: 'The mutual connections between two individuals'});
	$("#onegroup").tooltip({placement: 	'right', title: 'The members of one group'});
	$("#twogroup").tooltip({placement: 	'right', title: 'The mutual members of two groups'});

	//clicking menu buttons to show search bars
	$('li').click(function(e){
		document.getElementById('googleaddnode').reset();
		document.getElementById('googleaddedge').reset();
		$('section').css('display','none');	
		var id = '#' + e.target.id + 'form';
		$(id).css('display','block');
	});
	$('.toggle').click(function(e){
		$('.toggle').removeClass('active');
		$(this).addClass('active');
	});
	$('#findtwogroup').click(function(e){
		$('#twogroupsmenu').css('display','block');
	});

    //SLIDER FOR CONFIDENCE INTERVAL
    // CI1 = 0.0-0.19, CI2 = 0.2-0.39, CI3 = 0.4-0.59, CI4 = 0.6-0.79, CI5 = 0.81-1.0
    var confidence = "CI2";
    $("#confidInt td").click(function(){
    	$("#confidInt td").css('background', '#FFF');
    	confidence = this.id;
    	var cid = Number(confidence.charAt(2)); //number for conf int
    	for (var i=0; i<=cid; i++){
    		var temp = "#CI"+i;
    		$(temp).css('background', '#8F9094');
    	}
    	$(this).css('background', '#73757D');
    })
});