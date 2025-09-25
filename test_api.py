import tensorflow as tf
model = tf.keras.models.load_model('D:/LeafLense-2/LeafLense-2/backend/models/trained_model.keras')
print(model.summary())
