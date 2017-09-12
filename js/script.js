
var macAddresses = [],
	plotIds = [],
	blocks = [];
function loadParkingPlot(blockId){
	
	$(".plotIdDropdown").empty();
	
	$.getJSON( "https://cg-parking-t.run.aws-usw02-pr.ice.predix.io/getPlotId/"+blockId, function( data ) {//E-Block
		plotIds = data;
		$(".plotIdDropdown").append("<option>--select plot Id--</option>");
		
		$.each(plotIds,function(i){
			//console.log(plotIds[i].plotid);
			$(".plotIdDropdown").append("<option id="+plotIds[i].plotid+">"+plotIds[i].plotid+"</option>");
		});
  	
	});
}

function loadNodes(blockSelected){

	$(".blockContainer").empty().fadeOut("fast");
	$(".actionContainer").hide();
	
	$.getJSON( "https://cg-parking-t.run.aws-usw02-pr.ice.predix.io/getNodeDiscovery", function( data ) {
		
		//console.log(data);
		macAddresses = data;
		
		//draw sections equivalent to no. of mac addresses
		$.each(macAddresses,function(i){
			$(".blockContainer").append('<div class="block">'
						+'<span>'
							+'<span class="labelText">mac Address</span>'
							+'<select class="configDropDown macDropdown">'
							+'</select>'
						+'</span>'
						+'<span>'
							+'<span class="labelText">Plot Ids</span>'
							+'<select class="configDropDown plotIdDropdown">'
							+'</select>'
						+'</span>'
					+'</div>').fadeIn();	
		});
		$(".actionContainer").fadeIn();
		$(".macDropdown").append("<option>--Select mac address--</option>");
		$.each(macAddresses,function(i){

		//add values to the mac address drop downs
		$(".macDropdown").append("<option id="+macAddresses[i].ipAddress+">"+macAddresses[i].macAddress+"</option>");	
		});
		
		loadParkingPlot(blockSelected);
	});
	
}
function loadBlocks(){

	$.getJSON( "https://cg-parking-t.run.aws-usw02-pr.ice.predix.io/getBlock", function(data) {//E-Block
		
		//console.log(data);
		blocks = data;
		$("#blockId").append("<option>--select block--</option>");
	
		$.each(blocks,function(i){
			console.log(data[i]);
			$("#blockId").append("<option id="+blocks[i].blockName+">"+blocks[i].blockName+"</option>");
		});
  	
	});
	$("#blockId").change(function(){
		
		$(".location").empty();
		$(".plots").empty();
		
		var blockSelected = $("#blockId").val();
		
		$.each(blocks,function(i){
			if(blocks[i].blockName == blockSelected){
				$(".location").append('<span class="keyText">Block location : </span>'
						+'<span class="valueText">'+blocks[i].BlockLocation+'</span>');
				$(".plots").append('<span class="keyText">Plots : </span>'
						+'<span class="valueText">'+blocks[i].Plots+'</span>');
			}
		});
		loadNodes(blockSelected);
	});
}
function createJSON() {
    jsonObj = [];
    $(".macDropdown").each(function() {

        var macAddress = $(this).val();
        var ipAddress = $("option:selected",this).attr("id");
		var available = "2"; //Changed default status to "2", indicating sensor registered but parking status not known
		var plotId = $(this).parent().siblings().find(".plotIdDropdown option:selected").val();

        item = {}
		item ["ipAddress"] = ipAddress;
        item ["macAddress"] = macAddress;
     	item ["available"] = available;
		item ["plotId"] = plotId;

        jsonObj.push(item);
    });

    //console.log(JSON.stringify(jsonObj));
	return jsonObj;
}
function saveConfiguration(){
	var jsonObjects = createJSON();
	
	$.ajax({
		url:"https://cg-parking-t.run.aws-usw02-pr.ice.predix.io/saveParkingMapping" ,
		type: "POST",
		data: JSON.stringify(jsonObjects),
		contentType: "application/json; charset=utf-8",
		success: function(result) {
		 alert("Configuration saved successfully!!");
		},
		error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR + " : " + textStatus + " : " + errorThrown);
        }		
	});
}
function refreshParkinLots(){
		$.getJSON( "https://cg-parking-t.run.aws-usw02-pr.ice.predix.io/getParkingData", function( data ) {
			
			
			$.each( data, function(i) {
					
				console.log("Processing :"+JSON.stringify(data[i]));
				if(data[i].available == "0")
				{
					console.log("PlodID: "+data[i].plotId+ " is not available");
					var plot = $("#"+data[i].plotId).attr("src","images/1484683382_car.png");
					var plot = $("#"+data[i].plotId).attr("style","transform: rotate(0deg);height: 30px");
					//$("#"+data[i].plotId).css("opacity", "1");
				}
				else if(data[i].available == "1"){
				
					console.log("PlodID: "+data[i].plotId+ " is available");
					//$("#"+data[i].plotId).hide();
					//$("#"+data[i].plotId).css("opacity", "0");
					var plot = $("#"+data[i].plotId).attr("src","");
					var plot = $("#"+data[i].plotId).attr("style","transform: rotate(270deg)");
					$("#"+data[i].plotId)["0"].parentElement.style["0"]="";
					
				} 
				else if(data[i].available == "2")
				{
					console.log("PlodID: "+data[i].plotId+ " has new sensor installed");
					$("#"+data[i].plotId).show();
					var plot = $("#"+data[i].plotId).attr("src","images/sensornew.png");
					//$("#"+data[i].plotId).css("opacity", "1");
				}
				else if(data[i].available == "-1")
				{
					console.log("PlodID: "+data[i].plotId+ " sensor is down");
					$("#"+data[i].plotId).show();
					var plot = $("#"+data[i].plotId).attr("src","images/sensordown_a1.png");
					//$("#"+data[i].plotId).css("opacity", "1");
				}
			});
			setTimeout("refreshParkinLots()",5000);
			console.log("---------------------------------------");
			
		});
	}
	
	
function loadParkinLots(){
		$(".parkingLot").empty();
		$.getJSON( "https://cg-parking-t.run.aws-usw02-pr.ice.predix.io/getParkingData", function( data ) {
			$.each( data, function(i) {
				/*
				if(data[i].available){
				
					console.log("--available--");
					console.log(data[i].plotId);
					$(".parkingLot").append("<div id='"+data[i].plotId+"' class='parkingArea available'><span class='noIcon'></span><span class='plotLabel'>"+data[i].plotId+"</span></div>");
				
				} else{
					console.log("--unavailable--");
					console.log(data[i].plotId);
					$(".parkingLot").append("<div id='"+data[i].plotId+"' class='parkingArea unavailable'><span class='carIcon'></span><span class='plotLabel'>"+data[i].plotId+"</span></div>");
				}
				*/
				if(data[i].available == "0")
				{
					console.log("--unavailable--");
					console.log(data[i].plotId);
					$(".parkingLot").append("<div id='"+data[i].plotId+"' class='parkingArea unavailable'><span class='carIcon'></span><span class='plotLabel'>"+data[i].plotId+"</span></div>");
				}
				else if(data[i].available == "1"){
				
					console.log("--available--");
					console.log(data[i].plotId);
					$(".parkingLot").append("<div id='"+data[i].plotId+"' class='parkingArea available'><span class='noIcon'></span><span class='plotLabel'>"+data[i].plotId+"</span></div>");
				
				} 
				else if(data[i].available == "2")
				{
					console.log("--init--");
					console.log(data[i].plotId);
					$(".parkingLot").append("<div id='"+data[i].plotId+"' class='parkingArea init'><span class='noIcon'></span><span class='plotLabel'>"+data[i].plotId+"</span></div>");
				}
				else if(data[i].available == "-1")
				{
					console.log("--sensorDown--");
					console.log(data[i].plotId);
					$(".parkingLot").append("<div id='"+data[i].plotId+"' class='parkingArea sensorDown'><span class='noIcon'></span><span class='plotLabel'>"+data[i].plotId+"</span></div>");
				}
			});
			setTimeout("loadParkinLots()",5000);
			console.log(data);
	  
		});
	}
	
$(document).ready(function(){
	
$("#configTab").on("click",function(){
	$("#dasboardLeftNav li").removeClass("active");
	$(this).addClass("active");
	$("#parkinglotContainer").fadeOut("fast");
	$("#configurationContainer").show();
});
$("#parkingTab").on("click",function(){
	$("#dasboardLeftNav li").removeClass("active");
	$(this).addClass("active");
	$("#configurationContainer").fadeOut("fast");
	$("#parkinglotContainer").fadeIn("slow");
});
	// loadBlocks();
	// loadParkinLots();
	
	refreshParkinLots();
		
});
function resetConfiguration(){

}
function openNav() {
    document.getElementById("sidebar-collapse").style.width = "250px";
}

function closeNav() {
    document.getElementById("sidebar-collapse").style.width = "0";
}
