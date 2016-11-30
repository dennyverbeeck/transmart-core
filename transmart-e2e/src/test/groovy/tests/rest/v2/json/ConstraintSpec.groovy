package tests.rest.v2.json

import base.RESTSpec
import protobuf.ObservationsMessageProto
import selectors.protobuf.ObservationSelector
import selectors.protobuf.ObservationSelectorJson

import static config.Config.EHR_ID
import static config.Config.PATH_HYPERCUBE
import static config.Config.PATH_PATIENT_SET
import static org.hamcrest.Matchers.*
import static spock.util.matcher.HamcrestSupport.that
import static tests.rest.v2.Operator.*
import static tests.rest.v2.ValueType.*
import static tests.rest.v2.constraints.*

class ConstraintSpec extends RESTSpec{

    /**
     * TrueConstraint.class,
     BiomarkerConstraint.class,
     ModifierConstraint.class,
     FieldConstraint.class,
     ValueConstraint.class,
     TimeConstraint.class,
     PatientSetConstraint.class,
     Negation.class,
     Combination.class,
     TemporalConstraint.class,
     ConceptConstraint.class,
     StudyConstraint.class,
     NullConstraint.class
     */
    def final INVALIDARGUMENTEXCEPTION = "InvalidArgumentsException"
    def final EMPTYCONTSTRAINT = "Empty constraint parameter."

    /**
     *  when:" I do a Get query/observations with a wrong type."
     *  then: "then I get a 400 with 'Constraint not supported: BadType.'"
     */
    def "Get /query/observations malformed query"(){
        when:" I do a Get query/observations with a wrong type."
        def constraintMap = [type: 'BadType']

        def responseData = get(PATH_HYPERCUBE, contentTypeForJSON, toQuery(constraintMap))

        then: "then I get a 400 with 'Constraint not supported: BadType.'"
        that responseData.httpStatus, is(400)
        that responseData.type, is(INVALIDARGUMENTEXCEPTION)
        that responseData.message, is('Constraint not supported: BadType.')
    }

    def "TrueConstraint.class"(){
        def constraintMap = [type: TrueConstraint]

        when:
        def responseData = get(PATH_HYPERCUBE, contentTypeForJSON, toQuery(constraintMap))

        then:
        ObservationSelectorJson selector = new ObservationSelectorJson(parseHypercube(responseData))

        (0..<selector.cellCount).each {
            assert selector.select(it, "ConceptDimension", "conceptCode", 'String')
        }
    }

    def "BiomarkerConstraint.class"(){

    }

    def "ModifierConstraint.class"(){
        def constraintMap = [
                type: ModifierConstraint, path:"\\Public Studies\\TUMOR_NORMAL_SAMPLES\\Sample Type\\",
                values: [type: ValueConstraint, valueType: STRING, operator: EQUALS, value: "Tumor"]
        ]

        when:
        def responseData = get(PATH_HYPERCUBE, contentTypeForJSON, toQuery(constraintMap))

        then:
        ObservationSelectorJson selector = new ObservationSelectorJson(parseHypercube(responseData))

        selector.cellCount == 3
        (0..<selector.cellCount).each {
            assert selector.select(it, "ConceptDimension", "conceptCode", 'String') == 'TNS:LAB:CELLCNT'
        }

        when:
        constraintMap = [
                type: ModifierConstraint, modifierCode: "TNS:SMPL",
                values: [type: ValueConstraint, valueType: STRING, operator: EQUALS, value: "Tumor"]
        ]
        responseData = get(PATH_HYPERCUBE, contentTypeForJSON, toQuery(constraintMap))
        selector = new ObservationSelectorJson(parseHypercube(responseData))

        then:
        selector.cellCount == 3
        (0..<selector.cellCount).each {
            assert selector.select(it, "ConceptDimension", "conceptCode", 'String') == 'TNS:LAB:CELLCNT'
        }
    }

    def "FieldConstraint.class"(){
        def constraintMap = [type: FieldConstraint,
                             field: [dimension: 'PatientDimension',
                                     fieldName: 'age',
                                     type: NUMERIC ],
                             operator: LESS_THAN,
                             value:100]
        when:
        def responseData = get(PATH_HYPERCUBE, contentTypeForJSON, toQuery(constraintMap))

        then:
        ObservationSelectorJson selector = new ObservationSelectorJson(parseHypercube(responseData))


        (0..<selector.cellCount).each {
            assert selector.select(it, "PatientDimension", "age", 'Int') < 100
        }
    }

    def "ValueConstraint.class"(){
        def constraintMap = [type: ValueConstraint, valueType: NUMERIC, operator: GREATER_THAN, value:176]
        when:
        def responseData = get(PATH_HYPERCUBE, contentTypeForJSON, toQuery(constraintMap))

        then:
        ObservationSelectorJson selector = new ObservationSelectorJson(parseHypercube(responseData))

        (0..<selector.cellCount).each {
            assert selector.select(it) > 176
        }
    }

    def "TimeConstraint.class"(){
        def date = toDateString("01-01-2016Z")
        def constraintMap = [type: TimeConstraint,
                             field: [dimension: 'StartTimeDimension', fieldName: 'startDate', type: DATE ],
                             operator: AFTER,
                             values: [date]]
        when:
        def responseData = get(PATH_HYPERCUBE, contentTypeForJSON, toQuery(constraintMap))

        then:
        ObservationSelectorJson selector = new ObservationSelectorJson(parseHypercube(responseData))

        (0..<selector.cellCount).each {
            assert selector.select(it, "ConceptDimension", "conceptCode", 'String') != ''
        }
    }

    def "PatientSetConstraint.class"(){
        def setID = post(PATH_PATIENT_SET, contentTypeForJSON, [name: 'test_PatientSetConstraint'], toJSON([type: PatientSetConstraint, patientIds: -62]))
        def constraintMap = [type: PatientSetConstraint, patientSetId: setID.id]


        when:
        def responseData = get(PATH_HYPERCUBE, contentTypeForJSON, toQuery(constraintMap))

        then:
        ObservationSelectorJson selector = new ObservationSelectorJson(parseHypercube(responseData))
        (0..<selector.cellCount).each {
            assert selector.select(it, "ConceptDimension", "conceptCode", 'String') != ''
        }

        when:
        constraintMap = [type: PatientSetConstraint, patientIds: -62]
        responseData = get(PATH_HYPERCUBE, contentTypeForJSON, toQuery(constraintMap))
        selector = new ObservationSelectorJson(parseHypercube(responseData))

        then:
        (0..<selector.cellCount).each {
            assert selector.select(it, "ConceptDimension", "conceptCode", 'String') != ''
        }
    }

    def "Negation.class"(){
        def constraintMap = [
                type: Negation,
                arg: [type: PatientSetConstraint, patientIds: [-62, -52, -42]]
        ]
        when:
        def responseData = get(PATH_HYPERCUBE, contentTypeForJSON, toQuery(constraintMap))


        then:
        ObservationSelectorJson selector = new ObservationSelectorJson(parseHypercube(responseData))

        (0..<selector.cellCount).each {
            assert !selector.select(it, "StudyDimension", "studyId", 'String').equals('EHR')
        }
    }

    def "Combination.class"(){
        def constraintMap = [
                type: Combination,
                operator: AND,
                args: [
                        [type: PatientSetConstraint, patientSetId: 0, patientIds: -62],
                        [type: ConceptConstraint, path: "\\Public Studies\\EHR\\Vital Signs\\Heart Rate\\"]
                ]
        ]
        when:
        def responseData = get(PATH_HYPERCUBE, contentTypeForJSON, toQuery(constraintMap))
        ObservationSelectorJson selector = new ObservationSelectorJson(parseHypercube(responseData))

        then:
        (0..<selector.cellCount).each {
            assert selector.select(it, "ConceptDimension", "conceptCode", 'String').equals('EHR:VSIGN:HR')
        }
    }

    def "TemporalConstraint.class"(){
        def constraintMap = [
                type: TemporalConstraint,
                operator: AFTER,
                eventConstraint: [
                        type: ValueConstraint,
                        valueType: NUMERIC,
                        operator: LESS_THAN,
                        value: 60
                ]
        ]
        when:
        def responseData = get(PATH_HYPERCUBE, contentTypeForJSON, toQuery(constraintMap))


        then:
        ObservationSelectorJson selector = new ObservationSelectorJson(parseHypercube(responseData))

        HashSet conceptCodes = []
        (0..<selector.cellCount).each {
            conceptCodes.add selector.select(it, "ConceptDimension", "conceptCode", 'String')
        }
        assert conceptCodes.size() == 4
        assert conceptCodes.containsAll("EHR:VSIGN:HR","EHRHD:VSIGN:HR","EHRHD:HD:EXPLUNG","EHRHD:HD:EXPBREAST")
    }

    def "ConceptConstraint.class"(){
        def constraintMap = [type: ConceptConstraint, path: "\\Public Studies\\EHR\\Vital Signs\\Heart Rate\\"]
        when:
        def responseData = get(PATH_HYPERCUBE, contentTypeForJSON, toQuery(constraintMap))

        then:
        ObservationSelectorJson selector = new ObservationSelectorJson(parseHypercube(responseData))

        (0..<selector.cellCount).each {
            assert selector.select(it, "ConceptDimension", "conceptCode", 'String').equals('EHR:VSIGN:HR')
        }
    }

    def "StudyConstraint.class"(){
        def constraintMap = [type: StudyConstraint, studyId: EHR_ID]
        when:
        def responseData = get(PATH_HYPERCUBE, contentTypeForJSON, toQuery(constraintMap))

        then:
        ObservationSelectorJson selector = new ObservationSelectorJson(parseHypercube(responseData))

        (0..<selector.cellCount).each {
            assert selector.select(it, "StudyDimension", "studyId", 'String').equals('EHR')
        }
    }

    def "NullConstraint.class"(){
        def constraintMap = [
                type: NullConstraint,
                field: [dimension: 'EndTimeDimension', fieldName: 'endDate', type: DATE ]
        ]

        when:
        def responseData = get(PATH_HYPERCUBE, contentTypeForJSON, toQuery(constraintMap))

        then:
        ObservationSelectorJson selector = new ObservationSelectorJson(parseHypercube(responseData))

        HashSet conceptCodes= []
        (0..<selector.cellCount).each {
            conceptCodes.add(selector.select(it, "ConceptDimension", "conceptCode", 'String'))
        }
        conceptCodes.containsAll(['CV:DEM:SEX:M', 'CV:DEM:SEX:F', 'CV:DEM:RACE', 'CV:DEM:AGE'])
    }

}