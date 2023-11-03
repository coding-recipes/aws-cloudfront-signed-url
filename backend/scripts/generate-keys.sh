FOLDER="keys"

mkdir -p $FOLDER
cd $FOLDER

# if private_key.pem exists and public_key.pem exists and $1 is not in [--force, -f], then exit
if [ -f private_key.pem ] && [ -f public_key.pem ] && [ "$1" != "--force" ] && [ "$1" != "-f" ]; then
    echo "Keys already exist. Use --force or -f to overwrite."
    exit 0
fi

rm -rf private_key.pem
rm -rf public_key.pem

openssl genrsa -out private_key.pem 2048
openssl rsa -pubout -in private_key.pem -out public_key.pem