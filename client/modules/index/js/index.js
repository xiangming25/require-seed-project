;(function(){
	require(['/vendor/main.js'],function(){
		require(['jquery','default'],function($,defaultObj){
			// alert('yes');
			$(function(){
				console.log('加载完成!');
				console.log(defaultObj.username);
				console.log(defaultObj.password);
			});
		});
	});
})();