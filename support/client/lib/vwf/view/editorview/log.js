define({
	initialize:function(div)
	{
		this.popup = null;
		this.open = function()
		{
			if(!this.popup)
				this.popup =  window.open(window.location + "/vwf/view/editorview/logger.html","_blank","height=500,width=500,location=no,menubar=no,status=no,titlebar=no,toolbar=no");
		}
		this.close = function()
		{
			if(this.popup)
				this.popup.close()
			this.popup = null;
		}
		this.log = function()
		{

		}
		this.warn = function()
		{

		}
		this.error = function()
		{

		}
		this.info = function()
		{

		}
		window.logger = this;
		
	}
});