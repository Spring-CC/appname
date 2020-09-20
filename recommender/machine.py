import numpy as np
import pandas as pd
from pathlib import Path
from ast import literal_eval
from scipy.sparse import csr_matrix
from sklearn.neighbors import NearestNeighbors
import scipy
import sys


# sparse matrix
swipeddata_df = pd.read_csv(
    'data/testdata2.csv', usecols=[0, 1, 2], index_col=1)
swipeddata_df.swiped_right = swipeddata_df.swiped_right.apply(literal_eval)
new_df = swipeddata_df.explode("swiped_right")

# create sparse matrix
user_pivot = new_df.pivot(
    index="_id", columns='swiped_right', values='swiped_right').notna()
matrix = scipy.sparse.csr_matrix(user_pivot.values)


# KNN algorithm
knn_recomm = NearestNeighbors(
    n_neighbors=9, algorithm="brute", metric="cosine")
knn_recomm.fit(matrix)

knn_recomm_df = pd.DataFrame(
    knn_recomm, index=new_df.columns, columns=new_df.columns)

#print(knn_recomm_df)


# find a recommended user who have
random_user = np.random.choice(user_pivot.shape[0])
distances, indices = knn_recomm.kneighbors(
    user_pivot.iloc[random_user].values.reshape(1, -1), n_neighbors=9)


def find_similaruser(user):
    distances, indices = knn_recomm.kneighbors(
        user_pivot.loc[user].values.reshape(1,-1), n_neighbors=9
    )
    for i in range(0, len(distances.flatten())):
        #if i == 0:
            #print('Recommendations for user:', user)
        #else:
        print('{0}'.format( user_pivot.index[indices.flatten()[i]]))



if __name__ == '__main__' :
    args = sys.argv
    find_similaruser(args[1])