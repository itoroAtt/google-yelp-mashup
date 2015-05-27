function MapViewModel() {
	var map;
	var yelp = [];

	function initialize(){			
		google.maps.visualRefresh = true;

		var initial = new google.maps.LatLng(33.7489954,-84.3879824);
		map   = new google.maps.Map(document.getElementById('map_canvas'), {
			zoom: 8,
			center: initial,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControl:false,
			zoomControl: true,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.LARGE
			},
			scaleControl: false,
			rotateControl:false,
			panControl:false

		});
		//Specify Yelp Category...
		getYelp('restaurant');
		
	}
	
	google.maps.event.addDomListener(window, 'load', initialize);
		
		
	//resize map to fit screen
	google.maps.event.addDomListener(window, "resize", function() {
		var center = map.getCenter();
		google.maps.event.trigger(map, "resize");
		map.setCenter(center); 
	});
		
	function getYelp(term) {
		bounds = new google.maps.LatLngBounds ();
		$.getJSON('http://api.yelp.com/business_review_search?lat='+map.getCenter().lat()+'&long='+map.getCenter().lng()+'&limit=20&ywsid=ynoYeq0HNwWfPKFRqK-5qg&term='+term+'&callback=?',
			function(data)
			{
					
				$.each(data.businesses, function(i,item){
					generateInfoWindow(item);
					createYelpMarker(i,item.latitude,item.longitude,item.name, infowindowcontent);
				});                  
				
			}
		);
	}
	
	function generateInfoWindow(dataItem) {
		infowindowcontent = '<strong>'+dataItem.name+'</strong><br>';
		infowindowcontent += '<img src="'+dataItem.photo_url+'"><br>';
		infowindowcontent += formatPhoneNumber(dataItem.phone);
		infowindowcontent += '<img class="ratingsimage" src="'+dataItem.rating_img_url_small+'"/> based on ';
		infowindowcontent += dataItem.review_count + ' reviews<br/>';
		infowindowcontent += '<a href="'+dataItem.url+'" target="_blank">Check us out on Yelp</a>';
	}
	
	var infowindow = new google.maps.InfoWindow();
		   
	//Function to create yelp marker
	function createYelpMarker(i,latitude,longitude,title, infowindowcontent) {
		var markerLatLng = new google.maps.LatLng(latitude,longitude);  
		
		bounds.extend(markerLatLng);
		map.fitBounds(bounds);

		yelp[i] = new google.maps.Marker({
			position: markerLatLng,
			map: map,
			title: title,
			icon: 'images/google-marker.png'
		});

		google.maps.event.addListener(yelp[i], 'click', function() {
			infowindow.setContent(infowindowcontent);
			infowindow.open(map,yelp[i]);
		});
		
		//build string for the infowindow, then append to the unordered list on the page
		$("<li />").html(infowindowcontent).click(function(){ 
			map.panTo(yelp[i].getPosition());
			infowindow.setContent(infowindowcontent);
			infowindow.open(map,yelp[i]);
		}).appendTo("#resultsList");
	}
			
			
		
	//formats yelp phone number
	function formatPhoneNumber(num) {
		if(num.length != 10) return '';
		return '(' + num.slice(0,3) + ') ' + num.slice(3,6) + '-' + num.slice(6,10) + '<br/>';
	}

	function clearMarkers() {
		setAllMap(map);
	}

	function setAllMap(map) {
		for (var i = 0; i < yelp.length; i++) {
			yelp[i].setMap(map);
		}
	}
	this.updateMap = function() {
		var term = "restaurant";
			clearMarkers();
			bounds = new google.maps.LatLngBounds ();
			$("#errorMessage").empty().hide();
			$("#spinner").show();
						
			
			var termEntered = $("#term").val();
			termEntered = termEntered.toLowerCase();
			
			bounds = new google.maps.LatLngBounds ();
			$.getJSON('http://api.yelp.com/business_review_search?lat='+map.getCenter().lat()+'&long='+map.getCenter().lng()+'&limit=20&ywsid=ynoYeq0HNwWfPKFRqK-5qg&term='+term+'&callback=?',
				function(data)
				{
					var count = 0;
					$("#resultsList").empty();
					$.each(data.businesses, function(i,item){
						var searchReturn = item.name;
						searchReturn = searchReturn.toLowerCase();
						if(searchReturn.indexOf(termEntered) >= 0) {
							count++;
							generateInfoWindow(item);							
							createYelpMarker(i,item.latitude,item.longitude,item.name, infowindowcontent);		
							map.setZoom(14);
						} 
						
					});                
					$("#spinner").hide();
					var errorString = "Filter returned " + count + " result(s)...";
					$("#errorMessage").append(errorString);
					$("#errorMessage").show();       
					if(count === 0) {
						$("#resultsList").hide();
					} else {
						$("#resultsList").show();
					}
				});
			
		};
		
		function showOfflineMessage() {
			$("#wrapper").hide();
			$(".offline").show();
		}
}

// Activates knockout.js
ko.applyBindings(new MapViewModel());