/* 
	price-3-toggle-class
*/
if($(".txa-price-4-toggle-btn").length) {
	$('.txa-price-4-toggle-btn').on('click', function () {
		$(".txa-price-4-toggle").toggleClass('active');
		$(".txa-price-4-toggle-btn").toggleClass('active');
	});
}
