package org.transmartproject.db.multidimquery

import com.google.common.collect.ImmutableList
import org.transmartproject.core.dataquery.DataRow
import org.transmartproject.core.dataquery.Patient
import org.transmartproject.core.dataquery.TabularResult
import org.transmartproject.core.dataquery.assay.Assay
import org.transmartproject.core.dataquery.highdim.AssayColumn
import org.transmartproject.core.dataquery.highdim.BioMarkerDataRow
import org.transmartproject.core.exceptions.InvalidArgumentsException
import org.transmartproject.core.multidimquery.HypercubeValue
import org.transmartproject.core.multidimquery.dimensions.BioMarker
import org.transmartproject.db.dataquery.MockTabularResult
import spock.lang.Specification

import static org.transmartproject.db.multidimquery.DimensionImpl.*
import static org.transmartproject.db.multidimquery.HddTabularResultHypercubeAdapter.*


class HddTabularResultHypercubeAdapterSpec extends Specification {

    TabularResult mockTabular
    List<Patient> patients
    List<Assay> assays
    List<String> biomarkers
    List values = []
    List getCubeValues() {
        values.collect {
            if(it instanceof Double) return it
            if(it instanceof Map) return it.values()
            throw new RuntimeException()
        }.flatten()
    }

    int nBioMarkers
    int nAssays

    // Why isn't this method in the default groovy methods?
    static Iterator repeat(start=null, Closure block) {
        [hasNext: {true},
         next: {
             start = block.call(start)
         }] as Iterator
    }

    private def val(Iterator v) {def next = v.next(); values << next; next}

    void setupData(values) {

        patients = [-42, -43, -44].collect { id ->
            [getId: {id as Long}] as Patient
        }
        assays = [[-55, -56, -57], patients].transpose().collect { code, patient ->
            [getSampleCode: {code as String}, getLabel: {code as String}, getPatient: {patient}] as AssayColumn
        }

        biomarkers = "marker1 marker2 marker3 marker4".split()

        def v = values

        def rows = biomarkers.collect {
            new BioMockRow<Double>(
                    bioMarker: "bio"+it,
                    label: it,
                    cells: [val(v), val(v), val(v)],
                    columns: assays,
            )
        }

        mockTabular = new MockTabularResult(
                indicesList: assays,
                rowsList: rows
        )
         // Our TabularResult is now a table with 3 columns and 4 rows (so 3 assays/patients and 4 biomarkers)
        nAssays = 3
        nBioMarkers = 4
    }

    static class BioMockRow<CELL> extends MockRow<AssayColumn, CELL> implements BioMarkerDataRow<CELL> {
        String bioMarker
    }

    static class MockRow<COL, CELL> implements DataRow<COL, CELL> {
        List<CELL> cells
        protected List<COL> columns

        String label

        Iterator<CELL> iterator() { cells.iterator() }
        CELL getAt(int i) { cells[i] }

        @Lazy private Map<COL, CELL> index = [columns, cells].transpose().collectEntries()

        CELL getAt(COL assay) {
            index[assay]
        }
    }


    void testDoubles() {
        setup:
        setupData(repeat(Math.PI) {++it})

        HddTabularResultHypercubeAdapter cube = new HddTabularResultHypercubeAdapter(mockTabular)
        List<HypercubeValue> values = cube.toList()

        def biomarkerIdx = cube.getIndexGetter(BIOMARKER)
        def assayIdx = cube.getIndexGetter(ASSAY)
        def patientIdx = cube.getIndexGetter(PATIENT)

        when:
        cube.getIndexGetter(PROJECTION)

        then:
        thrown(IllegalArgumentException)

        expect:
        values*.value == this.cubeValues
        cube.dimensions as List == [BIOMARKER, ASSAY, PATIENT]
        (cube.dimensionElements(PATIENT) as ArrayList).sort {-it.id} == patients
        (0..2).each {
            assert cube.dimensionElement(ASSAY, it) == assays[it]
        }
        (0..2).collect {cube.dimensionElementKey(PATIENT, it)} as Set == patients*.id as Set
        (0..2).each {
            assert cube.dimensionElementKey(ASSAY, it) == assays[it].sampleCode
        }
        cube.dimensionsPreloadable == false
        cube.dimensionsPreloaded == false
        [cube.dimensionElements(BIOMARKER), biomarkers].transpose().each { BioMarker actual, String expectedLabel ->
            assert actual.label == expectedLabel
            assert actual.biomarker == "bio$expectedLabel".toString()
        }

        (0..<nBioMarkers).each { int row ->
            (0..<nAssays).each { int col ->
                assert values[row*nAssays+col][PATIENT] == patients[col]
                assert values[row*nAssays+col][ASSAY] == assays[col]
                assert values[row*nAssays+col][BIOMARKER].label == biomarkers[row]
            }
        }

        (0..<nBioMarkers).each { int row ->
            (0..<nAssays-1).each { int col ->
                assert biomarkerIdx(values[row*nAssays+col]) == biomarkerIdx(values[row*nAssays+col+1])
            }
        }

        (0..<nBioMarkers-1).each { int row ->
            (0..<nAssays).each { int col ->
                assert assayIdx(values[row*nAssays+col]) == assayIdx(values[(row+1)*nAssays+col])
                assert patientIdx(values[row*nAssays+col]) == patientIdx(values[(row+1)*nAssays+col])
            }
        }

        when:
        cube.dimensionElements(PROJECTION)

        then:
        thrown InvalidArgumentsException

        when:
        cube.dimensionElement(CONCEPT, 1)

        then:
        thrown InvalidArgumentsException

        cleanup:
        cube.close()
        this.values.clear()
    }

    void testAllDataProjection() {
        setup:
        setupData(repeat([
                value: Math.PI,
                logValue: Math.log(Math.PI),
                extra: "foo",
        ]) { Map it ->
            Map m = it.clone()
            m.value++
            m.logValue = Math.log(m.value)
            m
        })

        def projectionKeys = ImmutableList.copyOf "value logValue extra".split()

        HddTabularResultHypercubeAdapter cube = new HddTabularResultHypercubeAdapter(mockTabular)
        List<HypercubeValue> values = cube.toList()

        expect:

        values*.value == this.cubeValues
        cube.dimensions as List == [BIOMARKER, ASSAY, PATIENT, PROJECTION]
        (cube.dimensionElements(patientDim) as ArrayList).sort {-it.id} == patients
        cube.dimensionElements(projectionDim) == projectionKeys
        (0..2).each {
            assert cube.dimensionElement(assayDim, it) == assays[it]
            assert cube.dimensionElement(projectionDim, it) == projectionKeys[it]
        }
        (0..2).collect {cube.dimensionElementKey(patientDim, it)} as Set == patients*.id as Set
        (0..2).each {
            assert cube.dimensionElementKey(assayDim, it) == assays[it].sampleCode
            assert cube.dimensionElementKey(projectionDim, it) == projectionKeys[it]
        }
        cube.dimensionsPreloadable == false
        cube.dimensionsPreloaded == false
        [cube.dimensionElements(biomarkerDim), biomarkers].transpose().each { BioMarker actual, String expectedLabel ->
            assert actual.label == expectedLabel
            assert actual.biomarker == "bio$expectedLabel".toString()
        }

        (0..2).each {
            assert values[it*projectionKeys.size()][patientDim] == patients[it]
            assert values[it*projectionKeys.size()][assayDim] == assays[it]
            assert values[it][biomarkerDim].label == biomarkers[0]
            assert values[it][projectionDim] == projectionKeys[it]

            // this one is a bit brittle, but the iteration order of the map values is fixed.
            assert values[it].getDimElementIndex(projectionDim) == it
        }

        values[5].availableDimensions == cube.dimensions

        when:
        cube.dimensionElement(CONCEPT, 1)

        then:
        thrown InvalidArgumentsException


        cleanup:
        cube.close()
        this.values.clear()
    }

}
