_default:
    @just --list

# Bump manifest.json to VERSION, commit with the README entry, tag vVERSION and push (the tag push runs the release workflow)
release version:
    git diff --quiet HEAD -- . ':!README.md' || (echo "Only README.md may have changes" && exit 1)
    grep -qx '## v{{version}}' README.md || (echo "Add a '## v{{version}}' entry to README.md first" && exit 1)
    perl -pi -e 's/"version": "[^"]*"/"version": "{{version}}"/' manifest.json
    git commit -am "bump version to {{version}}"
    git tag v{{version}}
    git push origin master v{{version}}
