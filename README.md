# qlik-calendar-quick-picker
Qlik Sense Extension which allows you to quickly select date ranges based on Master Calendar Flags. 

I am intending to integrate this into the Qlik Dashboard Bundle's Date Picker, but am releasing this as is 
a) to get feedback and suggestions 
b) in case it takes a long time to do the Date Picker integration.

By Master Calendar Flags I mean Dimensions associated with Dates, typically used in Set Analysis expressions - eg LastWeek, Last4Weeks, CurrentYear, LastYear etc.

This extension assumes these date ranges ARE CONTIGUOUS - it makes the selection based on min & max values (because this is how the Date Picker works).

How To Use
+ Drag onto sheet
+ Select your Date Dimension
+ Choose between Buttons & Dropdown Menu in 'Display As'
+ Create a '|' separated list of your Master Calendar Flags (you can optionally create a different Label for each using '~')
