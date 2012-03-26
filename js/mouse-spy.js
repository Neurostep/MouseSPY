(function($, w) {
	var collectTimeout, sendTimeout, storage = [], errorCount = 0;
	MouseSPY = {
		config: {},
		init: function(config) {
			config = $.extend(true, {
				url: "",
				collectTimeout: 30,
				sendTimeout: 10000,
				method: "POST",
				maxErrorCounts: 5
			}, config);
			this.config = config;
			return this;
		},
		start: function() {
			this.collect();
			clearTimeout(sendTimeout);
			sendTimeout = setTimeout(function() {
				if (!storage.length) {
					this.start();
					return;
				}
				$.ajax({
					url: this.config.url,
					type: this.config.method,
					data: {data: JSON.stringify(storage)}
				})
				.success(function(response) {
					storage = [];
					errorCount = 0;
					this.start();
				}.bind(this))
				.fail(function(response) {
					clearTimeout(collectTimeout);
					errorCount++;
					if (errorCount >= this.config.maxErrorCounts) {
						this.stop();
					} else {
						this.start();
					}
				}.bind(this))
			}.bind(this), this.config.sendTimeout);
		},
		stop: function() {
			clearTimeout(collectTimeout);
			clearTimeout(sendTimeout);
			$(w).unbind("mousemove");
		},
		collect: function() {
			$(w).unbind("mousemove").mousemove(function(e) {
				clearTimeout(collectTimeout);
				collectTimeout = setTimeout(function(){
					storage.push({
						x: e.pageX,
						y: e.pageY
					});
				}, this.config.collectTimeout);
			}.bind(this));
		}
	};
})(jQuery, window);
