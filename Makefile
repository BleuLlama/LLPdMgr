# Unnecessary makefile for electron apps
#
################################################################################

all:  notice

################################################################################
notice:
	@echo Available targets:
	@echo ...... exe ...... build exes
	@echo ...... icons .... build icon binaries in icon/
	@echo ...... clean  ... delete generated files
	@echo ...... run ...... run the app
.PHONY: notice

################################################################################

icons:
	@echo "++ Generate icon files..."
	@cd icon ; sh build_icns.sh
.PHONY: icons


exe:
	@echo "++ Generate executable bundles..."
	npm run make
.PHONY: exe


run:
	@echo == Running App
	npm run start
.PHONY: run

edit:
	@echo == Opening VSCode
	open llpdmgr.code-workspace
.PHONY: edit

clean:
	@echo "-- Remove generated files..."
	@rm -rf out
	@cd icon ; sh clean.sh
.PHONY: clean

################################################################################

erase_icon_cache:
	sudo rm -rfv /Library/Caches/com.apple.iconservices.store; sudo find /private/var/folders/ \( -name com.apple.dock.iconcache -or -name com.apple.iconservices \) -exec rm -rfv {} \; ; sleep 3;sudo touch /Applications/* ; killall Dock; killall Finder

