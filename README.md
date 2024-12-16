# Competitive Companion Example

This is an example on how to retrieve parsed problem data from [Competitive Companion](https://github.com/jmerle/competitive-companion).

## Instructions

1. Clone this repository and `cd` into it.
2. Run `npm install`.
3. Customize `CP_HOME` (like `$HOME`, `~` for ubuntu or `F:`, `C:` for windows) `CP_FOLDER` (I use `ccode` as my cp folder) in `.env` where you want to store and input and expected files.
4. Run `npm start`.
5. Go to a problem like [this](http://codeforces.com/problemset/problem/1/A) one, click on the green plus icon and look at the terminal where you ran `npm start`.

I use vim and I code in `~/ccode` folder where I written a bash script named `runtests.sh`.

```bash
#!/bin/bash

reset

g++ $1.cpp -Wall -DONPC -o $1

cnt=0
for i in incp*.txt; do
	./$1 < $i > outcp$cnt.txt
	sed -i 's/[ \t]*$//' outcp$cnt.txt
	if !(cmp -s "outcp$cnt.txt" "expcp$cnt.txt")
	then
		echo -e "\e[101mError in test $cnt!\e[0m"
		echo -e "\e[103;100mInput\e[0m"
		cat $i
		echo -e "\e[41mWrong Output\e[0m"
		cat outcp$cnt.txt
		echo -e "\e[44;33mCorrect Output\e[0m"
		cat expcp$cnt.txt
	else
		echo -e "\e[42;97mPassed $cnt\e[0m"
	fi
	cnt=$((cnt+1))
done;
```

All the input and expected files are stored in my `~/ccode` folder and I compile through these files using a vim shortcut.

```vimrc
autocmd FileType cpp map <F5> :w<CR>:!clear && bash ~/ccode/runtests.sh %<<CR>
```

For creating new testcase I have `newtest.sh` file. I use `ctrl + d` to take expected value and again `ctrl + d` will terminate the bash script.

```bash
#!/bin/bash

cnt=0
for i in incp*.txt; do
	if [ -e "$i" ]; then
		cnt=$((cnt + 1));
	fi
done;

echo -e "\e[4mInput $cnt (Ctrl + D to save and exit)\e[0m"
cat > tempInp.txt

echo -e "\e[4mExpected $cnt (Ctrl + D to save and exit)\e[0m"
cat > tempExp.txt

cat tempInp.txt > incp$cnt.txt
cat tempExp.txt > expcp$cnt.txt
```

I have created a shorcut for creating a new testcase using `F4` in vim.

```vimrc
autocmd FileType cpp map <F4> :!clear && bash ~/ccode/newtest.sh %<<CR>
```

To run this project on startup your device you can use `pm2`

```bash
# Installing pm2
npm install -g pm2 # may require sudo

# Starting the app
pm2 start index.js --name cpParser
pm2 save    # saves the running processes
            # if not saved, pm2 will forget
            # the running apps on next boot


# check status
pm2 list

# IMPORTANT: If you want pm2 to start on system boot
pm2 startup # starts pm2 on computer boot

# Remove init script via
pm2 unstartup systemd
```
