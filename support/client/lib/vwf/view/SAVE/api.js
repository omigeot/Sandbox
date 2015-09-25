define([], function()
{

	return {
		create: function(ID, auto, done)
		{
			var postData = {
				object:
				{}
			};
			postData.object.auto = auto;
			postData.object.ID = ID;
			postData.object.type = "create";
			postData.object = JSON.stringify(postData.object)
			var self = this;
			$.post(this.baseServerAddress + "/object", postData, function(data)
			{
				if (done)
					done(data);
			});
		},
		action: function(action, arguments, names, done)
		{
			var json = {
				action: action,
				arguments: arguments,
				names: names
			};
			$.post(this.baseServerAddress + "/action", json, function()
			{
				if (done)
					done()
			});
		},
		KbId: function(ID, parent_KbID, done, fail)
		{
			var query = [ID + "_KbId"];

			jQuery.ajax(
				{
					url: this.baseServerAddress + "/query",
					type: 'post',
					cache: false,
					data:
					{
						type: "KbId",
						query: JSON.stringify(
						{
							type: 'KbId',
							parent: parent_KbID,
							query: query
						})
					},
				})
				.done(function(data)
				{
					if (done)
						done(data)
				})
				.fail(function()
				{
					if (fail)
						fail();
				})
		},
		setBaseServerAddress: function(addr)
		{
			this.baseServerAddress = addr;
		}
	}
})
