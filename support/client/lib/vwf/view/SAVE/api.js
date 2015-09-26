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
	    var data = JSON.stringify(
      {
        type: 'KbId',
        parent: parent_KbID,
        query: [ID + "_KbId"]
      });

      fetch(this.baseServerAddress + '/query', {
        method: 'post',
        mode: 'cors',
        body: 'query=' + data,
      })
      .then(function(response) { return response.json(); })
      .then(function(json) {
        if (done) done(json);
      })
      .catch(function(e) {
        console.error(e);

        if (fail) fail();
      });
		},
		setBaseServerAddress: function(addr)
		{
			this.baseServerAddress = addr;
		}
	}
})
