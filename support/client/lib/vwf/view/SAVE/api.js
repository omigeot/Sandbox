define([], function()
{

	return {
		reset: function(done, fail)
		{
			jQuery.ajax(
				{
					url: this.getBaseServerAddress() + "/query",
					type: 'post',
					cache: false,
					data:
					{
						query: JSON.stringify(
						{
							type: "Reset",
						})
					},
				})
				.done(function(data)
				{
					if (done)
						done(data)
				})
				.fail(function(data)
				{
					if (fail)
						fail(data)
				})
		},
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
			$.post(this.getBaseServerAddress() + "/object", postData, function(data)
			{
				if (done)
					done(data);
			});
		},
		action: function(action, arguments, names, done)
		{
			var json = {
				action: params[0],
				arguments: [params[1]],
				names: [params[2]]
			};
			$.post(this.getBaseServerAddress() + "/action", json, function()
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
					url: this.getBaseServerAddress() + "/query",
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
		inventory: function(done, fail)
		{
			var url = this.getBaseServerAddress() + '/inventory';
			$.ajax(
				{
					url: url,
					type: 'get',
					cache: false
				})
				.done(function(data)
				{
					if (done)
						done(data)
				})
				.fail(function(jqXHR, textStatus, errorThrown)
				{
					if (fail)
						fail(textStatus)
				});
		},
		generateSolution:function(done)
		{
			$.get(this.getBaseServerAddress() + "/PutExercise/generateSolution",function(){
				if(done)
					done()
			});
		},
		getBaseServerAddress: function()
		{
			return this.baseServerAddress;
		},
		setBaseServerAddress: function(add)
		{
			this.baseServerAddress = add;
		}
	}
})