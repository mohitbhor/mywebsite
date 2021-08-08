from market import app
import os
#app._static_folder = os.path.abspath("static/")
#Checks if the run.py file has executed directly and not imported
if __name__ == '__main__':
    app.run(debug=True,port=5555)