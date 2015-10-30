# Sandbox API Crash Report

This report identifies requests to the SandboxAPI endpoints which produce Server Errors or Crashes and context to reproduce them in the interest of finding solutions and eliminating such.

**Note:** All API commands require login unless otherwise specified.

**Note:** 3dr commands were skipped as of this report (10/06/2015).

------
## GET Operations

### apppath
**GET {serverRoot}/vwfdatamanager.svc/apppath**

####Causes no crashes or errors

Accepts:
*(None)*

**Note:** *Login not required*

Returns:
```javascript
The path to the application. (default: /adl/sandbox)
```

### cameras
**GET {serverRoot}/vwfdatamanager.svc/cameras**

####Causes no crashes

Fixed 10/20/2015 err with no SID sandboxAPI line 992
With no SID
{"name":"cameras","method":"GET","qs":{},"url":"http://localhost:3000/sandbox/adl/vwfdatamanager.svc/cameras"}
500 TypeError: Arguments to path.join must be strings<br> &nbsp; &nbsp;at f (path.js:204:15)<br> &nbsp; &nbsp;at Object.filter (native)<br> &nbsp; &nbsp;at Object.exports.join (path.js:209:40)<br> &nbsp; &nbsp;at GetCameras (c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:1012:27)<br> &nbsp; &nbsp;at c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:1588:7<br> &nbsp; &nbsp;at Object.exports.GetSessionData (c:\Users\creighta\workspace\sandbox\support\server\sessions.js:59:9)<br> &nbsp; &nbsp;at Object.serve (c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:1490:11)<br> &nbsp; &nbsp;at routeToAPI (c:\Users\creighta\workspace\sandbox\support\server\appserver.js:333:20)<br> &nbsp; &nbsp;at Layer.handle [as handle_request] (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\layer.js:82:5)<br> &nbsp; &nbsp;at trim_prefix (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:302:13)

Accepts:

`SID` (`String`)
State identifier.

Returns:
```javascript
200 + Array of camera objects added to Sandbox world.
```

### copyinstance
**GET {serverRoot}/vwfdatamanager.svc/copyinstance**

Fixed 10/20/2015 crashed with null, invalid, or empty SID sandboxAPI line 761 AC
With no SID
{"name":"copyinstance","method":"GET","qs":{},"url":"http://localhost:3000/sandbox/adl/vwfdatamanager.svc/copyinstance"}
500 TypeError: Cannot read property &#39;length&#39; of undefined<br> &nbsp; &nbsp;at CopyInstance (c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:664:10)<br> &nbsp; &nbsp;at c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:1645:7<br> &nbsp; &nbsp;at Object.exports.GetSessionData (c:\Users\creighta\workspace\sandbox\support\server\sessions.js:24:9)<br> &nbsp; &nbsp;at Object.serve (c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:1490:11)<br> &nbsp; &nbsp;at routeToAPI (c:\Users\creighta\workspace\sandbox\support\server\appserver.js:333:20)<br> &nbsp; &nbsp;at Layer.handle [as handle_request] (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\layer.js:82:5)<br> &nbsp; &nbsp;at trim_prefix (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:302:13)<br> &nbsp; &nbsp;at c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:270:7<br> &nbsp; &nbsp;at Function.proto.process_params (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:321:12)<br> &nbsp; &nbsp;at next (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:261:10)

Accepts:

`SID` (`String`)
State identifier. Properly formatted: \_adl\_sandbox\_xxx...xxx\_

Returns:
```javascript
200 + new state identifier
```

### datafile
**GET {serverRoot}/vwfdatamanager.svc/datafile**

####Causes no crashes or errors - as far as I can figure out

Accepts:

Something I haven't figured out yet.

Returns:
```javascript
Not sure how this one works.
```

### docdir
**GET {serverRoot}/vwfdatamanager.svc/docdir**

####Causes no crashes or errors

Accepts:

*(None)*

Returns:
```javascript
The directory structure of the documention in the VW Sandbox repository on github.
**Note:** *For updated documentation see [http://sandboxdocs.readthedocs.org/en/latest/](http://sandboxdocs.readthedocs.org/en/latest/ "Sandbox Documentation")*
```

### forgotpassword
**GET {serverRoot}/vwfdatamanager.svc/forgotpassword**

####Causes no crashes

**Side Effects:**
if logged in can trigger for a different user

Accepts:

Must either be logged in or have a valid `UID`.

Returns:
```javascript
200

Emails user with temporary password.

(See additional messages in log.)
```

### getanalytics.js
**GET {serverRoot}/vwfdatamanager.svc/getanalytics.js**

####Causes no crashes or errors - as far as I can figure out

I don't get this one

Accepts:

*(None)*

Returns:
```javascript
200 //Analytics not found
```

### getassets
**GET {serverRoot}/vwfdatamanager.svc/getassets**

with good sid - 200 fine

with bad sid - 200 [] empty array

fixed 10/21/2015 detects and handles when no SID is present sandboxAPI line 1782 AC
**with no sid - 500 big ugly TypeError**

{"name":"getassets","method":"GET","qs":{},"url":"http://localhost:3000/sandbox/adl/vwfdatamanager.svc/getassets"}
500 TypeError: Cannot call method &#39;replace&#39; of undefined<br> &nbsp; &nbsp;at getState (c:\Users\creighta\workspace\sandbox\support\server\AssetPreload.js:121:26)<br> &nbsp; &nbsp;at Object.getAssets (c:\Users\creighta\workspace\sandbox\support\server\AssetPreload.js:133:2)<br> &nbsp; &nbsp;at c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:1776:20<br> &nbsp; &nbsp;at Object.exports.GetSessionData (c:\Users\creighta\workspace\sandbox\support\server\sessions.js:24:9)<br> &nbsp; &nbsp;at Object.serve (c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:1490:11)<br> &nbsp; &nbsp;at routeToAPI (c:\Users\creighta\workspace\sandbox\support\server\appserver.js:333:20)<br> &nbsp; &nbsp;at Layer.handle [as handle_request] (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\layer.js:82:5)<br> &nbsp; &nbsp;at trim_prefix (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:302:13)<br> &nbsp; &nbsp;at c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:270:7<br> &nbsp; &nbsp;at Function.proto.process_params (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:321:12)

Accepts:

`SID` (`String`)
Sandbox world identifier.

Returns:
```javascript
200 + Array of asset objects.
```

### geteditorcss
**GET {serverRoot}/vwfdatamanager.svc/geteditorcss**

####Causes no crashes or errors

Accepts:

*(None)*

Returns:
```javascript
CSS for Sandbox editors.
```

### globalassetassetdata
**GET {serverRoot}/vwfdatamanager.svc/globalassetassetdata**

####Causes no crashes or errors

Accepts:

`AID` (`String`)
Asset identifier.

Returns:
```javascript
200 + {} Asset object.
```

### globalassetmetadata
**GET {serverRoot}/vwfdatamanager.svc/globalassetmetadata**

####Causes no crashes or errors

Accepts:

`AID` (`String`)
Asset identifier.

**Note:** *Login not required.*

Returns:
```javascript
200 + Asset meta data object.
Includes:
uploader - UID
title - String
type - String
uploaded - date time stamp
description - string
type - type of asset (Primitive, ...)
```

### globalassets
**GET {serverRoot}/vwfdatamanager.svc/globalassets**

####Causes no crashes or errors

Accepts:

(*None*)

**Note:** *Login not required.*

Returns:
```javascript
200 + Array of asset objects.
Includes:
description - String
key - AID Asset Identifier
```

### inventory
**GET {serverRoot}/vwfdatamanager.svc/inventory**

####Causes no crashes or errors

Accepts:

*(None)*

Returns:
```javascript
200 + [Array of inventory objects]
```

### inventoryitemassetdata
**GET {serverRoot}/vwfdatamanager.svc/inventoryitemassetdata**

####Causes no crashes or errors

Accepts:

`AID` (`String`)
Asset identifier.

Returns:
```javascript
200 + {asset data of inventory item}
```

### inventoryitemmetadata
**GET {serverRoot}/vwfdatamanager.svc/inventoryitemmetadata**

####Causes no crashes or errors

Accepts:

`AID` (`String`)
inventory identifier

Returns:
```javascript
200 + {asset item meta data}
```

### login
**GET {serverRoot}/vwfdatamanager.svc/login**

####Causes no crashes or errors

Returns:
```javascript
200 No longer supported. Login now travels over the socket handshake.
```

### logindata
**GET {serverRoot}/vwfdatamanager.svc/logindata**

####Causes no crashes or errors

Returns:
```javascript
200 + {Login data object}
Includes:
user_uid - UID
username - String
instances - [Array of instances]
clients - [Array of clients]
```

### logout
**GET {serverRoot}/vwfdatamanager.svc/logout**

Fixed 10/20/2015 sandboxAPI line 140 - reversed parameters to (response, code, msg) AC
500 TypeError - Big Ugly when not logged in
{"name":"logout","method":"GET","qs":{"S":"_adl_sandbox_L8BnGGj85ZHAmsy1_","CID":"joe"},"url":"http://localhost:3000/sandbox/adl/vwfdatamanager.svc/logout"}

500 'text/html; charset=utf-8' 'TypeError: Object Client Not Logged In has no me
thod &#39;writeHead&#39;<br> &nbsp; &nbsp;at respond (c:\\Users\\creighta\\works
pace\\sandbox\\support\\server\\sandboxAPI.js:37:12)<br> &nbsp; &nbsp;at Instanc
eLogout (c:\\Users\\creighta\\workspace\\sandbox\\support\\server\\sandboxAPI.js
:140:3)<br> &nbsp; &nbsp;at c:\\Users\\creighta\\workspace\\sandbox\\support\\se
rver\\sandboxAPI.js:1690:7<br> &nbsp; &nbsp;at Object.exports.GetSessionData (c:
\\Users\\creighta\\workspace\\sandbox\\support\\server\\sessions.js:59:9)<br> &n
bsp; &nbsp;at Object.serve (c:\\Users\\creighta\\workspace\\sandbox\\support\\se
rver\\sandboxAPI.js:1490:11)<br> &nbsp; &nbsp;at routeToAPI (c:\\Users\\creighta
\\workspace\\sandbox\\support\\server\\appserver.js:333:20)<br> &nbsp; &nbsp;at
Layer.handle [as handle_request] (c:\\Users\\creighta\\workspace\\sandbox\\node_
modules\\express\\lib\\router\\layer.js:82:5)<br> &nbsp; &nbsp;at trim_prefix (c
:\\Users\\creighta\\workspace\\sandbox\\node_modules\\express\\lib\\router\\inde
x.js:302:13)<br> &nbsp; &nbsp;at c:\\Users\\creighta\\workspace\\sandbox\\node_m
odules\\express\\lib\\router\\index.js:270:7<br> &nbsp; &nbsp;at Function.proto.
process_params (c:\\Users\\creighta\\workspace\\sandbox\\node_modules\\express\\
lib\\router\\index.js:321:12)\n'

Accepts:

`S` (`String`)
valid state identifier

`CID` (`String`)
client identifier

Returns:
```javascript
200 Client Logged out `instance`
```

### profile
**GET {serverRoot}/vwfdatamanager.svc/profile**

####Causes no crashes or errors

Accepts:

*(None)*

Returns:
```javascript
200 + User profile object.
May include fields:
Username
Email
Avatar
Salt
inventoryKey
id
```

### profiles
**GET {serverRoot}/vwfdatamanager.svc/profiles**

####Causes no crashes or errors

Accepts:

*(None)*

Returns:
```javascript
Array of current UIDs.
```

### restorebackup
**GET {serverRoot}/vwfdatamanager.svc/restorebackup**

#big time crasher

Undefined SID - 500 TypeError

{"name":"restorebackup","method":"GET","qs":{"UID":"joe","statename":"state","backup":"statebackup1ba12a74-f1de-4df2-a0f7-e7622e06d1db"},"url":"http://localhost:3000/sandbox/adl/vwfdatamanager.svc/restorebackup"}

500 TypeError: Cannot read property &#39;length&#39; of undefined<br> &nbsp; &nbsp;at RestoreBackupState (c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:792:10)<br> &nbsp; &nbsp;at c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:1655:7<br> &nbsp; &nbsp;at Object.exports.GetSessionData (c:\Users\creighta\workspace\sandbox\support\server\sessions.js:24:9)<br> &nbsp; &nbsp;at Object.serve (c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:1490:11)<br> &nbsp; &nbsp;at routeToAPI (c:\Users\creighta\workspace\sandbox\support\server\appserver.js:333:20)<br> &nbsp; &nbsp;at Layer.handle [as handle_request] (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\layer.js:82:5)<br> &nbsp; &nbsp;at trim_prefix (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:302:13)<br> &nbsp; &nbsp;at c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:270:7<br> &nbsp; &nbsp;at Function.proto.process_params (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:321:12)<br> &nbsp; &nbsp;at next (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:261:10)

Not logged in - 500 uncaughtException

error: uncaughtException: Cannot read property 'UID' of null date=Mon Oct 05 201
5 16:23:32 GMT-0400 (Eastern Daylight Time), pid=3256, uid=null, gid=null, cwd=c
:\Users\creighta\workspace\sandbox, execPath=c:\Program Files\nodejs\node.exe, v
ersion=v0.10.28, argv=[c:\Program Files\nodejs\node.exe, c:\Users\creighta\works
pace\sandbox\app.js], rss=99127296, heapTotal=84202304, heapUsed=55623672, loada
vg=[0, 0, 0], uptime=29535.4519058, trace=[column=36, file=c:\Users\creighta\wor
kspace\sandbox\support\server\sandboxAPI.js, function=null, line=805, method=nul
l, native=false, column=9, file=c:\Users\creighta\workspace\sandbox\support\serv
er\DAL.js, function=null, line=499, method=null, native=false, column=25, file=c
:\Users\creighta\workspace\sandbox\support\server\DB_nedb.js, function=null, lin
e=28, method=null, native=false, column=17, file=c:\Users\creighta\workspace\san
dbox\node_modules\nedb\lib\executor.js, function=callback, line=30, method=null,
 native=false, column=12, file=c:\Users\creighta\workspace\sandbox\node_modules\
nedb\lib\datastore.js, function=Cursor.execFn, line=415, method=execFn, native=f
alse, column=17, file=c:\Users\creighta\workspace\sandbox\node_modules\nedb\lib\
cursor.js, function=Cursor._exec, line=172, method=_exec, native=false, column=1
3, file=c:\Users\creighta\workspace\sandbox\node_modules\nedb\lib\executor.js, f
unction=null, line=40, method=null, native=false, column=21, file=c:\Users\creig
hta\workspace\sandbox\node_modules\async\lib\async.js, function=Object.q.process
 [as _onImmediate], line=731, method=q.process [as _onImmediate], native=false,
column=15, file=timers.js, function=processImmediate [as _immediateCallback], li
ne=336, method=null, native=false], stack=[TypeError: Cannot read property 'UID'
 of null,     at c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.j
s:805:36,     at c:\Users\creighta\workspace\sandbox\support\server\DAL.js:499:9
,     at c:\Users\creighta\workspace\sandbox\support\server\DB_nedb.js:28:25,
  at callback (c:\Users\creighta\workspace\sandbox\node_modules\nedb\lib\executo
r.js:30:17),     at Cursor.execFn (c:\Users\creighta\workspace\sandbox\node_modu
les\nedb\lib\datastore.js:415:12),     at Cursor._exec (c:\Users\creighta\worksp
ace\sandbox\node_modules\nedb\lib\cursor.js:172:17),     at c:\Users\creighta\wo
rkspace\sandbox\node_modules\nedb\lib\executor.js:40:13,     at Object.q.process
 [as _onImmediate] (c:\Users\creighta\workspace\sandbox\node_modules\async\lib\a
sync.js:731:21),     at processImmediate [as _immediateCallback] (timers.js:336:
15)]
error:
error: TypeError: Cannot read property 'UID' of null
    at c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:805:36
    at c:\Users\creighta\workspace\sandbox\support\server\DAL.js:499:9
    at c:\Users\creighta\workspace\sandbox\support\server\DB_nedb.js:28:25
    at callback (c:\Users\creighta\workspace\sandbox\node_modules\nedb\lib\execu
tor.js:30:17)
    at Cursor.execFn (c:\Users\creighta\workspace\sandbox\node_modules\nedb\lib\
datastore.js:415:12)
    at Cursor._exec (c:\Users\creighta\workspace\sandbox\node_modules\nedb\lib\c
ursor.js:172:17)
    at c:\Users\creighta\workspace\sandbox\node_modules\nedb\lib\executor.js:40:
13
    at Object.q.process [as _onImmediate] (c:\Users\creighta\workspace\sandbox\n
ode_modules\async\lib\async.js:731:21)
    at processImmediate [as _immediateCallback] (timers.js:336:15)

statename and backup can be the same identifier, neither cannot be "state"

Accepts:

`SID` (`String`)
identifier of the current state

`statename` (`String`)
identifier of the current state??

`backup` (`String`)
identifier of the backup to restore to

Returns:
```javascript

200 Success
```

### salt
**GET {serverRoot}/vwfdatamanager.svc/salt**

####Causes no crashes

returns a salt for every inquiry, however status code is 200 for valid UID's and 401 otherwise

Accepts:

`UID` (`String`)
User identification

Returns:
```javascript
Salt for a given UID.
```

### saspath
**GET {serverRoot}/vwfdatamanager.svc/saspath**

###Causes no crashes or errors

Accepts:

(*None*)

Returns:
```javascript
The path to the asset directory. (default: /sas)
```

### sitelogin
**GET {serverRoot}/vwfdatamanager.svc/sitelogin**

401 if already logged in

getting hung up on check password without login

Accepts:

`UID` (`String`)
User identifier.

`P` (`String`)
User password. 

**Note:** *Must be logged out.*

Returns:
```javascript
Hangs up on check password.
```

### sitelogout
**GET {serverRoot}/vwfdatamanager.svc/sitelogout**

Accepts:

Not sure.

Returns:

```javascript
(*Nothing*)
```

### state
**GET {serverRoot}/vwfdatamanager.svc/state**

Accepts:

SID (`String`)
State identification.

Returns:
```javascript
200 + {State object}.
```

### statedata
**GET {serverRoot}/vwfdatamanager.svc/statedata**

Returns 200 and default data for any string given including NaN, null and "".

Without SID in qs (or undefined), crashes
info: statedata joe 3
error: uncaughtException: Cannot call method 'split' of undefined date=Tue Oct 0
6 2015 08:23:20 GMT-0400 (Eastern Daylight Time), pid=7812, uid=null, gid=null,
cwd=c:\Users\creighta\workspace\sandbox, execPath=c:\Program Files\nodejs\node.e
xe, version=v0.10.28, argv=[c:\Program Files\nodejs\node.exe, c:\Users\creighta\
workspace\sandbox\app.js], rss=93634560, heapTotal=78022720, heapUsed=58113400,
loadavg=[0, 0, 0], uptime=87123.8697748, trace=[column=14, file=c:\Users\creight
a\workspace\sandbox\support\server\examples.js, function=Object.exports.getExamp
leMetadata, line=60, method=exports.getExampleMetadata, native=false, column=11,
 file=c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js, function
=null, line=1616, method=null, native=false, column=9, file=c:\Users\creighta\wo
rkspace\sandbox\support\server\DAL.js, function=null, line=499, method=null, nat
ive=false, column=25, file=c:\Users\creighta\workspace\sandbox\support\server\DB
_nedb.js, function=null, line=30, method=null, native=false, column=17, file=c:\
Users\creighta\workspace\sandbox\node_modules\nedb\lib\executor.js, function=cal
lback, line=30, method=null, native=false, column=12, file=c:\Users\creighta\wor
kspace\sandbox\node_modules\nedb\lib\datastore.js, function=Cursor.execFn, line=
415, method=execFn, native=false, column=17, file=c:\Users\creighta\workspace\sa
ndbox\node_modules\nedb\lib\cursor.js, function=Cursor._exec, line=172, method=_
exec, native=false, column=13, file=c:\Users\creighta\workspace\sandbox\node_mod
ules\nedb\lib\executor.js, function=null, line=40, method=null, native=false, co
lumn=21, file=c:\Users\creighta\workspace\sandbox\node_modules\async\lib\async.j
s, function=Object.q.process [as _onImmediate], line=731, method=q.process [as _
onImmediate], native=false, column=15, file=timers.js, function=processImmediate
 [as _immediateCallback], line=336, method=null, native=false], stack=[TypeError
: Cannot call method 'split' of undefined,     at Object.exports.getExampleMetad
ata (c:\Users\creighta\workspace\sandbox\support\server\examples.js:60:14),
at c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:1616:11,
 at c:\Users\creighta\workspace\sandbox\support\server\DAL.js:499:9,     at c:\U
sers\creighta\workspace\sandbox\support\server\DB_nedb.js:30:25,     at callback
 (c:\Users\creighta\workspace\sandbox\node_modules\nedb\lib\executor.js:30:17),
    at Cursor.execFn (c:\Users\creighta\workspace\sandbox\node_modules\nedb\lib\
datastore.js:415:12),     at Cursor._exec (c:\Users\creighta\workspace\sandbox\n
ode_modules\nedb\lib\cursor.js:172:17),     at c:\Users\creighta\workspace\sandb
ox\node_modules\nedb\lib\executor.js:40:13,     at Object.q.process [as _onImmed
iate] (c:\Users\creighta\workspace\sandbox\node_modules\async\lib\async.js:731:2
1),     at processImmediate [as _immediateCallback] (timers.js:336:15)]
error:
error: TypeError: Cannot call method 'split' of undefined
    at Object.exports.getExampleMetadata (c:\Users\creighta\workspace\sandbox\su
pport\server\examples.js:60:14)
    at c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:1616:11
    at c:\Users\creighta\workspace\sandbox\support\server\DAL.js:499:9
    at c:\Users\creighta\workspace\sandbox\support\server\DB_nedb.js:30:25
    at callback (c:\Users\creighta\workspace\sandbox\node_modules\nedb\lib\execu
tor.js:30:17)
    at Cursor.execFn (c:\Users\creighta\workspace\sandbox\node_modules\nedb\lib\
datastore.js:415:12)
    at Cursor._exec (c:\Users\creighta\workspace\sandbox\node_modules\nedb\lib\c
ursor.js:172:17)
    at c:\Users\creighta\workspace\sandbox\node_modules\nedb\lib\executor.js:40:
13
    at Object.q.process [as _onImmediate] (c:\Users\creighta\workspace\sandbox\n
ode_modules\async\lib\async.js:731:21)
    at processImmediate [as _immediateCallback] (timers.js:336:15)

SID (`String`)
State identifier.

**Note:** *Login not required.*

Returns:
```javascript
200 + Brief information of state object which includes:
title
description
isExample
publishSettings
```

### statehistory
**GET {serverRoot}/vwfdatamanager.svc/statehistory**

####Causes no crashes or errors

SID (`String`)
State identifier.

**Note:** *Login not required.*

Returns:
```javascript
200 + History object containing two arrays: children and parents.
or 200 {"error":"inner state not found"}
```

### states
**GET {serverRoot}/vwfdatamanager.svc/states**

####Causes no crashes or errors

Accepts:

*(None)*

Returns:
```javascript
200 State data of every available world on server.
```

### stateslist
**GET {serverRoot}/vwfdatamanager.svc/stateslist**

####Causes no crashes.

With no SID
{"name":"stateslist","method":"GET","qs":{},"url":"http://localhost:3000/sandbox/adl/vwfdatamanager.svc/stateslist"}
500 TypeError: Cannot read property &#39;length&#39; of undefined<br> &nbsp; &nbsp;at GetStateList (c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:771:10)<br> &nbsp; &nbsp;at c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:1650:7<br> &nbsp; &nbsp;at Object.exports.GetSessionData (c:\Users\creighta\workspace\sandbox\support\server\sessions.js:59:9)<br> &nbsp; &nbsp;at Object.serve (c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:1490:11)<br> &nbsp; &nbsp;at routeToAPI (c:\Users\creighta\workspace\sandbox\support\server\appserver.js:333:20)<br> &nbsp; &nbsp;at Layer.handle [as handle_request] (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\layer.js:82:5)<br> &nbsp; &nbsp;at trim_prefix (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:302:13)<br> &nbsp; &nbsp;at c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:270:7<br> &nbsp; &nbsp;at Function.proto.process_params (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:321:12)<br> &nbsp; &nbsp;at next (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:261:10)

SID (`String`)
State identifier.

**Note:** *Login not required.*

Returns:
```javascript
200 Array of backup objects.
or 500 'text/plain' 'Error in trying to retrieve backup list\n'
```

### texture
**GET {serverRoot}/vwfdatamanager.svc/texture**

####Causes no crashes or errors.

Accepts:

`UID` (`String`)
Path and texture filename.

**Note:** *Login not required.*

Returns:
```javascript
200 + Image.
```

### textures
**GET {serverRoot}/vwfdatamanager.svc/textures**

####Causes no crashes or errors.

Accepts:

*(None)*

**Note:** *Login not required.*

Returns:
```javascript
200 + Object of directory objects with arrays of filenames.
```

### texturethumbnail
**GET {serverRoot}/vwfdatamanager.svc/texturethumbnail**

####Causes no crashes or errors.

Accepts:

`UID` (`String`)
Path and texture filename.

**Note:** *Login not required.*

Returns:
```javascript
200 + Image.
```

### thumbnail
**GET {serverRoot}/vwfdatamanager.svc/thumbnail**

With no SID
{"name":"thumbnail","method":"GET","qs":{},"url":"http://localhost:3000/sandbox/adl/vwfdatamanager.svc/thumbnail"}
info: thumbnail joe 3
TypeError: Cannot read property 'SID' of undefined
    at GetThumbnail (c:\Users\creighta\workspace\sandbox\support\server\sandboxA
PI.js:981:37)
    at c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:1583:7
    at Object.exports.GetSessionData (c:\Users\creighta\workspace\sandbox\suppor
t\server\sessions.js:24:9)
    at Object.serve (c:\Users\creighta\workspace\sandbox\support\server\sandboxA
PI.js:1490:11)
    at routeToAPI (c:\Users\creighta\workspace\sandbox\support\server\appserver.
js:333:20)
    at Layer.handle [as handle_request] (c:\Users\creighta\workspace\sandbox\nod
e_modules\express\lib\router\layer.js:82:5)
    at trim_prefix (c:\Users\creighta\workspace\sandbox\node_modules\express\lib
\router\index.js:302:13)
    at c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index
.js:270:7
    at Function.proto.process_params (c:\Users\creighta\workspace\sandbox\node_m
odules\express\lib\router\index.js:321:12)
    at next (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router
\index.js:261:10)

Accepts:

`SID` (`String`)
State identifier.

Returns:
```javascript
Thumbnail image of world.
```

### updatepassword
**GET {serverRoot}/vwfdatamanager.svc/updatepassword**

####Causes no crashes or errors

Accepts:

`P` (`String`)
Encrypted password.

Returns:
```javascript
```


----------

## POST Operations

### createprofile
**POST {serverRoot}/vwfdatamanager.svc/createprofile**

Can mix and match UID in qs vs. Username in form.

With no qs and no form - logged in or not
{"name":"createprofile","method":"POST","url":"http://localhost:3000/sandbox/adl/vwfdatamanager.svc/createprofile"}
500 TypeError: Cannot read property &#39;length&#39; of undefined<br> &nbsp; &nbsp;at validateUsername (c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:424:14)<br> &nbsp; &nbsp;at CreateProfile (c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:447:7)<br> &nbsp; &nbsp;at c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:1884:7<br> &nbsp; &nbsp;at Object.exports.GetSessionData (c:\Users\creighta\workspace\sandbox\support\server\sessions.js:24:9)<br> &nbsp; &nbsp;at Object.serve (c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:1490:11)<br> &nbsp; &nbsp;at routeToAPI (c:\Users\creighta\workspace\sandbox\support\server\appserver.js:333:20)<br> &nbsp; &nbsp;at Layer.handle [as handle_request] (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\layer.js:82:5)<br> &nbsp; &nbsp;at trim_prefix (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:302:13)<br> &nbsp; &nbsp;at c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:270:7<br> &nbsp; &nbsp;at Function.proto.process_params (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:321:12)

Accepts:

`UID` (`String`)
User identification.

`data` (`formData`)
Form of profile information. Username, Password and Email are required.

**Note:** *Must be logged out.*

Returns:
```javascript
200 
```

### createstate
**POST {serverRoot}/vwfdatamanager.svc/createstate**

Accepts:

*(None)*

Returns:
```javascript
200 Created state 'state identifier'.
```

### error
**POST {serverRoot}/vwfdatamanager.svc/error**

Accepts:

what is really wanted here?

Returns:
```javascript
200
```

### globalasset
**POST {serverRoot}/vwfdatamanager.svc/globalasset**

the POST URL must contain valid name/pass and that UID must match the Asset Author

Accepts:

`title` (`String`)(optional)
name of item on query string

`type` (`String`)(optional)
type of item on query string

`form` (`formdata`)(optional)

Returns:
```javascript
200 + String of Asset Identifier
```

### inventoryitem
**POST {serverRoot}/vwfdatamanager.svc/inventoryitem**

#### Causes no crashes or errors

the POST URL must contain valid name/pass and that UID must match the Asset Author

Accepts:

`title` (`String`)
name for item on query string

`type` (`String`)
type of item on query string

`data` (`formData`)
the item

Returns:
```javascript
200 + Asset Identifier
```

### inventoryitemmetadata
**POST {serverRoot}/vwfdatamanager.svc/inventoryitemmetadata**

#### Causes no crashes or errors

Accepts:

`AID` (`String`)
inventory identifier

`data` (`formData`)
the meta data for the item

Returns:
```javascript
200 + ok
```

### profile
**POST {serverRoot}/vwfdatamanager.svc/profile**

#### Causes no crashes

if logged out
500 'text/html; charset=utf-8' 'ReferenceError: filename is not defined<br> &nbs
p; &nbsp;at SaveProfile (c:\\Users\\creighta\\workspace\\sandbox\\support\\serve
r\\sandboxAPI.js:388:60)<br> &nbsp; &nbsp;at c:\\Users\\creighta\\workspace\\san
dbox\\support\\server\\sandboxAPI.js:1879:7<br> &nbsp; &nbsp;at Object.exports.G
etSessionData (c:\\Users\\creighta\\workspace\\sandbox\\support\\server\\session
s.js:59:9)<br> &nbsp; &nbsp;at Object.serve (c:\\Users\\creighta\\workspace\\san
dbox\\support\\server\\sandboxAPI.js:1490:11)<br> &nbsp; &nbsp;at routeToAPI (c:
\\Users\\creighta\\workspace\\sandbox\\support\\server\\appserver.js:333:20)<br>
 &nbsp; &nbsp;at Layer.handle [as handle_request] (c:\\Users\\creighta\\workspac
e\\sandbox\\node_modules\\express\\lib\\router\\layer.js:82:5)<br> &nbsp; &nbsp;
at trim_prefix (c:\\Users\\creighta\\workspace\\sandbox\\node_modules\\express\\
lib\\router\\index.js:302:13)<br> &nbsp; &nbsp;at c:\\Users\\creighta\\workspace
\\sandbox\\node_modules\\express\\lib\\router\\index.js:270:7<br> &nbsp; &nbsp;a
t Function.proto.process_params (c:\\Users\\creighta\\workspace\\sandbox\\node_m
odules\\express\\lib\\router\\index.js:321:12)<br> &nbsp; &nbsp;at next (c:\\Use
rs\\creighta\\workspace\\sandbox\\node_modules\\express\\lib\\router\\index.js:2
61:10)\n'

Accepts:

`logindata` (`String`)
valid session cookie

`data` (`formData`)
profile information **Note:** password cannot be updated by this method

Returns:
```javascript
200 
```

### publish
**POST {serverRoot}/vwfdatamanager.svc/publish**

Publish the world to a new world. This is just a copy with some special settings.

####Causes no crashes

Doesn't necessarily change data/settings.  Allows/ignores nonsense data in form.

Accepts:

`SID` (`String`)
state identifier

`publishdata` (`formdata`)
information about the state to publish

Returns:
```javascript
200 + SID
```

### statedata
**POST {serverRoot}/vwfdatamanager.svc/statedata**

####Causes no crashes

Does not change data.

Accepts:

`SID` (`String`)
State identifier.

`statedata` (`JSON object`)
World state definition.

Returns:
```javascript
200 + Created state `SID`
```

### thumbnail
**POST {serverRoot}/vwfdatamanager.svc/thumbnail**

With no SID
{"name":"thumbnail","method":"POST","qs":{},"form":{"image":"/9j/4AAQSk...BoQhB//Z"},"url":"http://localhost:3000/sandbox/adl/vwfdatamanager.svc/thumbnail"}
500 TypeError: Cannot read property &#39;length&#39; of undefined<br> &nbsp; &nbsp;at SaveThumbnail (c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:930:9)<br> &nbsp; &nbsp;at c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:1854:7<br> &nbsp; &nbsp;at Object.exports.GetSessionData (c:\Users\creighta\workspace\sandbox\support\server\sessions.js:24:9)<br> &nbsp; &nbsp;at Object.serve (c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:1490:11)<br> &nbsp; &nbsp;at routeToAPI (c:\Users\creighta\workspace\sandbox\support\server\appserver.js:333:20)<br> &nbsp; &nbsp;at Layer.handle [as handle_request] (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\layer.js:82:5)<br> &nbsp; &nbsp;at trim_prefix (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:302:13)<br> &nbsp; &nbsp;at c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:270:7<br> &nbsp; &nbsp;at Function.proto.process_params (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:321:12)<br> &nbsp; &nbsp;at next (c:\Users\creighta\workspace\sandbox\node_modules\express\lib\router\index.js:261:10)

Accepts:

`SID` (`String`)
State identifier.

`body` (`formdata`)
Image.

Returns:
```javascript
200 
```

### uploadtemp
**POST {serverRoot}/vwfdatamanager.svc/uploadtemp**

####Causes no crashes or errors

**Note:** *File can be found at Sandbox/tempupload*
**Note:** *Always returns 404 Not Found*

Accepts:

`body` (`formdata`)
image or something

Returns:
```javascript
404 Not Found 
```


------
## DELETE Operations

### globalasset
**DELETE {serverRoot}/vwfdatamanager.svc/globalasset**

Invalid AID crashes

{"name":"globalasset","method":"DELETE","qs":{"AID":"8fe41520-e46a-47c6-9834-23674a5063fc"},"url":"http://localhost:3000/sandbox/adl/vwfdatamanager.svc/globalasset"}

Error: read ECONNRESET

info: globalasset joe 3

error: User does not contain inventory item

error: uncaughtException: Cannot read property 'uploader' of null date=Mon Oct 0
5 2015 14:25:01 GMT-0400 (Eastern Daylight Time), pid=5204, uid=null, gid=null,
cwd=c:\Users\creighta\workspace\sandbox, execPath=c:\Program Files\nodejs\node.e
xe, version=v0.10.28, argv=[c:\Program Files\nodejs\node.exe, c:\Users\creighta\
workspace\sandbox\app.js], rss=243609600, heapTotal=204612520, heapUsed=18185045
6, loadavg=[0, 0, 0], uptime=22424.0611575, trace=[column=11, file=c:\Users\crei
ghta\workspace\sandbox\support\server\sandboxAPI.js, function=null, line=353, me
thod=null, native=false, column=13, file=c:\Users\creighta\workspace\sandbox\sup
port\server\DAL.js, function=null, line=231, method=null, native=false, column=1
7, file=c:\Users\creighta\workspace\sandbox\support\server\DAL.js, function=null
, line=303, method=null, native=false, column=25, file=c:\Users\creighta\workspa
ce\sandbox\support\server\DB_nedb.js, function=null, line=28, method=null, nativ
e=false, column=17, file=c:\Users\creighta\workspace\sandbox\node_modules\nedb\l
ib\executor.js, function=callback, line=30, method=null, native=false, column=12
, file=c:\Users\creighta\workspace\sandbox\node_modules\nedb\lib\datastore.js, f
unction=Cursor.execFn, line=415, method=execFn, native=false, column=17, file=c:
\Users\creighta\workspace\sandbox\node_modules\nedb\lib\cursor.js, function=Curs
or._exec, line=172, method=_exec, native=false, column=13, file=c:\Users\creight
a\workspace\sandbox\node_modules\nedb\lib\executor.js, function=null, line=40, m
ethod=null, native=false, column=21, file=c:\Users\creighta\workspace\sandbox\no
de_modules\async\lib\async.js, function=Object.q.process, line=731, method=q.pro
cess, native=false, column=27, file=c:\Users\creighta\workspace\sandbox\node_mod
ules\async\lib\async.js, function=next, line=728, method=null, native=false], st
ack=[TypeError: Cannot read property 'uploader' of null,     at c:\Users\creight
a\workspace\sandbox\support\server\sandboxAPI.js:353:11,     at c:\Users\creight
a\workspace\sandbox\support\server\DAL.js:231:13,     at c:\Users\creighta\works
pace\sandbox\support\server\DAL.js:303:17,     at c:\Users\creighta\workspace\sa
ndbox\support\server\DB_nedb.js:28:25,     at callback (c:\Users\creighta\worksp
ace\sandbox\node_modules\nedb\lib\executor.js:30:17),     at Cursor.execFn (c:\U
sers\creighta\workspace\sandbox\node_modules\nedb\lib\datastore.js:415:12),
at Cursor._exec (c:\Users\creighta\workspace\sandbox\node_modules\nedb\lib\curso
r.js:172:17),     at c:\Users\creighta\workspace\sandbox\node_modules\nedb\lib\e
xecutor.js:40:13,     at Object.q.process (c:\Users\creighta\workspace\sandbox\n
ode_modules\async\lib\async.js:731:21),     at next (c:\Users\creighta\workspace
\sandbox\node_modules\async\lib\async.js:728:27)]
error:
error: TypeError: Cannot read property 'uploader' of null
    at c:\Users\creighta\workspace\sandbox\support\server\sandboxAPI.js:353:11
    at c:\Users\creighta\workspace\sandbox\support\server\DAL.js:231:13
    at c:\Users\creighta\workspace\sandbox\support\server\DAL.js:303:17
    at c:\Users\creighta\workspace\sandbox\support\server\DB_nedb.js:28:25
    at callback (c:\Users\creighta\workspace\sandbox\node_modules\nedb\lib\execu
tor.js:30:17)
    at Cursor.execFn (c:\Users\creighta\workspace\sandbox\node_modules\nedb\lib\
datastore.js:415:12)
    at Cursor._exec (c:\Users\creighta\workspace\sandbox\node_modules\nedb\lib\c
ursor.js:172:17)
    at c:\Users\creighta\workspace\sandbox\node_modules\nedb\lib\executor.js:40:
13
    at Object.q.process (c:\Users\creighta\workspace\sandbox\node_modules\async\
lib\async.js:731:21)
    at next (c:\Users\creighta\workspace\sandbox\node_modules\async\lib\async.js
:728:27) 

Valid AID, but not the owner of the asset - 401 you are not the asset owner

Accepts:

`AID` (`String` or `Number`)
Asset Identifier.

Returns:
```javascript
200 Ok
```

### inventoryitem
**DELETE {serverRoot}/vwfdatamanager.svc/inventoryitem**

####Causes no crashes or errors

Accepts:

`AID` (`String` or is it a `number`)
inventory identifier

Returns:
```javascript
200 ok
```

### profile
**DELETE {serverRoot}/vwfdatamanager.svc/profile**

**Doesn't delete anything.**

Accepts:

*(None)*

Returns:
```javascript
200  - does not currently delete anything
```

### state
**DELETE {serverRoot}/vwfdatamanager.svc/state**

####Causes no crashes or errors
Must be owner of state.

Accepts:

`SID` (`String`)
state identifier

Returns:
```javascript
200 deleted instance
```
